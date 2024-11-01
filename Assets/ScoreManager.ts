@component
export class ScoreManager extends BaseScriptComponent {
    private score: number = 0;
    private points: number = 10;

    @input
    scoreText: Text;

    @input
    uiScore: Text;

    onAwake() {
        this.score = 0;
    }
    updateDisplay() {
        this.scoreText.text = `Score: ${this.score}`;
        this.uiScore.text = `Score: ${this.score}`;
    }
    resetScore() {
        this.score = 0;
        this.updateDisplay();
    }
    scoreUp() {
        this.score += this.points;
        this.updateDisplay();
    }
    scoreDown() {
        this.score -= this.points;
        this.updateDisplay();
    }
}
