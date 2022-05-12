/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { GoalEvaluator } from '../../../../build/yuka.module.js';

import { RestGoal, GatherGoal } from './Goals.js';

class RestEvaluator extends GoalEvaluator {

	calculateDesirability( girl ) {

		return 0;

	}

	setGoal( player ) {

		const currentSubgoal = player.brain.currentSubgoal();

		if ( ( currentSubgoal instanceof RestGoal ) === false ) {

			player.brain.clearSubgoals();

			player.brain.addSubgoal( new RestGoal( player ) );

		}

	}

}

class GatherEvaluator extends GoalEvaluator {

	calculateDesirability() {

		return 0.5;

	}

	setGoal( player ) {

		const currentSubgoal = player.brain.currentSubgoal();

		if ( ( currentSubgoal instanceof GatherGoal ) === false ) {

			player.brain.clearSubgoals();

			player.brain.addSubgoal( new GatherGoal( player ) );

		}

	}

}

export {
	RestEvaluator,
	GatherEvaluator
};
