/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { ArriveBehavior, Vehicle, GameEntity, Quaternion, AABB, Ray, Vector3, Think } from '../../../../build/yuka.module.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.109/build/three.module.js';
import { CustomObstacle } from './CustomObstacle.js';
import { Shotgun } from './Shotgun.js';
import { RestEvaluator, GatherEvaluator } from './Evaluators.js';

import world from './World.js';

const q = new Quaternion();
const aabb = new AABB();
const ray = new Ray();
const intersectionPoint = new Vector3();
const intersectionNormal = new Vector3();
const reflectionVector = new Vector3();

class Player extends Vehicle {

	constructor() {

		super();

		this.name = 'player';

		this.boundingRadius = 1;

		this.headContainer = new GameEntity();
		this.add( this.headContainer );

		this.head = new GameEntity();
		this.head.position.set( 0, 2, 0 );
		this.headContainer.add( this.head );

		this.weaponContainer = new GameEntity();
		this.head.add( this.weaponContainer );

		this.weapon = new Shotgun( this );
		this.weapon.position.set( 0.25, - 0.3, - 1 );
		this.weaponContainer.add( this.weapon );

		// brain
		/* this.brain = new Think( this );
		this.brain.addEvaluator( new GatherEvaluator() );

		const arriveBehavior = new ArriveBehavior();
		arriveBehavior.deceleration = 1.5;
		this.steering.add( arriveBehavior ); */

		this.forward.set( 0, 0, - 1 );
		this.maxSpeed = 12;
		this.updateOrientation = false;

	}

	getDirection( result ) {

		q.multiplyQuaternions( this.rotation, this.head.rotation );

		return result.copy( this.forward ).applyRotation( q ).normalize();

	}

	update( delta ) {

		const obstacles = world.obstacles;

		for ( let i = 0, l = obstacles.length; i < l; i ++ ) {

			const obstacle = obstacles[ i ];

			if ( obstacle instanceof CustomObstacle ) {

				// first check bounding volumes for intersection

				const squaredDistance = this.position.squaredDistanceTo( obstacle.position );
				const range = this.boundingRadius + obstacle.boundingRadius;

				if ( squaredDistance <= ( range * range ) ) {

					// compute AABB in world space for obstacle

					aabb.copy( obstacle.geometry.aabb ).applyMatrix4( obstacle.worldMatrix );

					// enhance the AABB with the bounding radius of the player

					aabb.max.addScalar( this.boundingRadius );
					aabb.min.subScalar( this.boundingRadius );

					// setup ray

					ray.origin.copy( this.position );
					ray.direction.copy( this.velocity ).normalize();

					// perform ray/AABB intersection test

					if ( ray.intersectAABB( aabb, intersectionPoint ) !== null ) {

						// derive normal vector

						aabb.getNormalFromSurfacePoint( intersectionPoint, intersectionNormal );

						// compute reflection vector

						reflectionVector.copy( ray.direction ).reflect( intersectionNormal );

						// compute new velocity vector

						const speed = this.getSpeed();

						this.velocity.addVectors( ray.direction, reflectionVector ).normalize();

						const f = 1 - Math.abs( intersectionNormal.dot( ray.direction ) );

						this.velocity.multiplyScalar( speed * f );

					}

				}

			}

		}

		/* this.brain.execute();

		this.brain.arbitrate(); */

		return super.update( delta );

	}

}

function createAnimationAction( mixer, clip ) {

	let action = mixer.clipAction( clip );
	action.play();
	action.enabled = false;

	return action;

}


export { Player };
