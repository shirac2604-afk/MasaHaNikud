import { GameFlowManager } from "../src/managers/GameFlowManager";
import { TurnManager, TurnPhase } from "../src/managers/TurnManager";
import { DebugLogger } from "../src/utils/DebugLogger";

DebugLogger.setEnabled(false);
const players = 4;
const turns = new TurnManager(players);
const phases: TurnPhase[] = [];
const flow = new GameFlowManager(turns, {
    onPhaseChanged: phase => phases.push(phase),
    onPlayerChanged: () => undefined
});

flow.start();
for (let i = 0; i < 1000; i += 1) {
    if (!flow.requestRoll()) throw new Error(`roll rejected at ${i}`);
    if (flow.requestRoll()) throw new Error(`double roll accepted at ${i}`);
    if (!flow.confirmRoll()) throw new Error(`movement rejected at ${i}`);
    if (!flow.confirmLanding()) throw new Error(`question rejected at ${i}`);
    if (!flow.confirmAnswer()) throw new Error(`answer rejected at ${i}`);
    if (flow.finishTurn() === undefined) throw new Error(`turn completion rejected at ${i}`);
}
if (flow.getPhase() !== TurnPhase.READY) throw new Error("flow did not return to READY");
if (flow.getCurrentPlayer() !== 0) throw new Error("player rotation mismatch");
console.log(`Stress flow passed: 1000 turns, ${phases.length} phase updates`);
