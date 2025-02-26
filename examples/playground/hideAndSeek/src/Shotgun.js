/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GameEntity, Ray, Vector3 } from '../../../../build/yuka.module.js';
import world from './World.js';

const intersectionPoint = new Vector3();
const target = new Vector3();
const muzzlePosition = new Vector3();
const scatter = new Vector3();

class Shotgun extends GameEntity {

	constructor( owner = null ) {

		super();

		this.owner = owner;

		this.status = STATUS.READY;

		this.roundsLeft = 12;
		this.roundsPerClip = 12;
		this.ammo = 48;
		this.maxAmmo = 96;

		// times are in seconds

		this.shotTime = 1;
		this.shotReloadTime = 0.5;
		this.reloadTime = 1.5;
		this.muzzleFireTime = 0.1;
		this.scatterFactor = 0.03;

		this.currentTime = 0;
		this.endTimeShot = Infinity;
		this.endTimeShotReload = Infinity;
		this.endTimeReload = Infinity;
		this.endTimeMuzzleFire = Infinity;

		this.muzzleSprite = world.assetManager.models.get( 'muzzle' );

		this.ui = {
			roundsLeft: document.getElementById( 'roundsLeft' ),
			ammo: document.getElementById( 'ammo' )
		};

		this.updateUI();

	}

	update( delta ) {

		this.currentTime += delta;

		if ( this.currentTime >= this.endTimeShotReload ) {

			const audio = world.audios.get( 'shot_reload' );
			if ( audio.isPlaying === true ) audio.stop();
			audio.play();

			this.endTimeShotReload = Infinity;

		}

		// check reload

		if ( this.currentTime >= this.endTimeReload ) {

			const toReload = this.roundsPerClip - this.roundsLeft;

			if ( this.ammo >= toReload ) {

				this.roundsLeft = this.roundsPerClip;
				this.ammo -= toReload;

			} else {

				this.roundsLeft += this.ammo;
				this.ammo = 0;

			}

			this.status = STATUS.READY;

			this.updateUI();

			this.endTimeReload = Infinity;

		}

	// check muzzle fire

		if ( this.currentTime >= this.endTimeMuzzleFire ) {

			this.muzzleSprite.visible = false;

			this.endTimeMuzzleFire = Infinity;

		}

	// check shoot

		if ( this.currentTime >= this.endTimeShot ) {

			if ( this.roundsLeft === 0 ) {

				this.status = STATUS.EMPTY;

			} else {

				this.status = STATUS.READY;

			}

			this.endTimeShot = Infinity;

		}

		return this;

	}

	reload() {

		if ( ( this.status === STATUS.READY || this.status === STATUS.EMPTY ) && this.ammo > 0 && this.roundsLeft < this.roundsPerClip) {

			this.status = STATUS.RELOAD;

			// audio

			const audio = world.audios.get( 'reload' );

			if ( audio.isPlaying === true ) audio.stop();

			audio.play();

			// animation

			const animation = world.animations.get( 'reload' );
			animation.stop();
			animation.play();

			//

			this.endTimeReload = this.currentTime + this.reloadTime;

		}

		return this;

	}

	shoot() {

		if ( this.status === STATUS.READY ) {

			this.status = STATUS.SHOT;

			// audio

			const audio = world.audios.get( 'shot' );
			if ( audio.isPlaying === true ) audio.stop();
			audio.play();

			// animation

			const animation = world.animations.get( 'shot' );
			animation.stop();
			animation.play();

			// muzzle fire

			this.muzzleSprite.visible = true;
			this.muzzleSprite.material.rotation = Math.random() * Math.PI;

			this.endTimeMuzzleFire = this.currentTime + this.muzzleFireTime;

			// adjust ammo

			const owner = this.owner;
			const head = owner.head;

			const ray = new Ray();

			// first calculate a ray that represents the actual look direction from the head position

			ray.origin.extractPositionFromMatrix( head.worldMatrix );
			owner.getDirection( ray.direction );

			// determine closest intersection point with world object

			const result = world.intersectRay( ray, intersectionPoint );

			// now calculate the distance to the closest intersection point. if no point was found,
			// choose a point on the ray far away from the origin

			const distance = ( result === null ) ? 1000 : ray.origin.distanceTo( intersectionPoint );

			// now let's change the origin to the weapon's position.

			target.copy( ray.origin ).add( ray.direction.multiplyScalar( distance ) );

			muzzlePosition.set( 0.15, 0.1, - 0.45 ).applyMatrix4( this.worldMatrix );
			ray.origin.copy( muzzlePosition );
			ray.direction.subVectors( target, ray.origin ).normalize();

			//

			for ( let i = 0; i < 6; i ++ ) {

				const r = ray.clone();

				scatter.x = ( 1 - Math.random() * 2 ) * this.scatterFactor;
				scatter.y = ( 1 - Math.random() * 2 ) * this.scatterFactor;
				scatter.z = ( 1 - Math.random() * 2 ) * this.scatterFactor;

				r.direction.add( scatter ).normalize();

				world.addBullet( owner, r );

			}

			this.roundsLeft --;

			
			this.endTimeShotReload = this.currentTime + this.shotReloadTime;
			this.endTimeShot = this.currentTime + this.shotTime;
			
			this.updateUI();
			
			// Auto reload
			if (this.roundsLeft == 0) {
				this.status = STATUS.READY;
				this.reload()
			}
		} else if ( this.status === STATUS.EMPTY ) {

			const audio = world.audios.get( 'empty' );
			if ( audio.isPlaying === true ) audio.stop();
			audio.play();

		}

		return this;

	}

	updateUI() {

		this.ui.roundsLeft.textContent = this.roundsLeft;
		this.ui.ammo.textContent = this.ammo;

	}

}

const STATUS = Object.freeze( {
	READY: 'ready', // the blaster is ready for the next action
	SHOT: 'shot', // the blaster is firing
	RELOAD: 'reload', // the blaster is reloading
	EMPTY: 'empty' // the blaster is empty
} );

export { Shotgun };
