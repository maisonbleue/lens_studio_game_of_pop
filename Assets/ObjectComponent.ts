import { Interactable } from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";
import { ScoreManager } from "ScoreManager";
import { MainController } from "MainController";
import { setTimeout } from "SpectaclesInteractionKit/Utils/debounce";

const GLOBAL_SCRIPT = global as any;

@component
export class ObjectComponent extends BaseScriptComponent {
    private interactable: Interactable;
    private selectedObject: SceneObject;

    @input
    scoreManager: ScoreManager;

    @input
    mainController: MainController;

    listenForInteraction = () => {
        try {
            // Check the name of the selected object and update the score accordingly
            if (this.selectedObject.name == "Sphere") {
                this.scoreManager.scoreUp();
            } else {
                this.scoreManager.scoreDown();
            }
            // Delete the spawned object after interaction
            this.delete();
        } catch (e) {
            print('Error playing hover audio: ' + e);
        }
    }

    onAwake() {
        this.selectedObject = this.getSceneObject();
        this.interactable = this.selectedObject.getComponent(Interactable.getTypeName());

        // Throw an error if the Interactable component is not found
        if (!this.interactable) {
            throw new Error('Could not find Interactable component on this SceneObject.');
        }

        // Add an event listener for when the object is hovered over
        this.interactable.onHoverEnter.add(this.listenForInteraction);
    }

    
    animateOut() {
        var startValue = { x: 10.0, y: 0.0 };
        var endValue = { x: 15.0, y: 1.0 };
        var startValueOut = { x: 15.0 };
        var endValueOut = { x: 0.0 };

        var onUpdate = (value) => {
            // this.menuAudio.volume = value.x;
            this.selectedObject.getTransform().setWorldScale(new vec3(value.x, value.x, value.x));
            if (value.y && this.selectedObject.getChildrenCount() > 0) {
                var child = this.selectedObject.getChild(0);
                child.getTransform().setLocalScale(new vec3(value.y, value.y, value.y));
            }
        }

        var tweenScaleIn = new GLOBAL_SCRIPT.TWEEN.Tween(startValueOut)
            .to(endValueOut, 0.25 * 1000.0)
            .easing(GLOBAL_SCRIPT.tweenManager.getTweenEasingType("Linear", "InOut"))
            .onUpdate(onUpdate);

        var tween = new GLOBAL_SCRIPT.TWEEN.Tween(startValue)
            .to(endValue, 0.25 * 1000.0)
            .easing(GLOBAL_SCRIPT.tweenManager.getTweenEasingType("Linear", "InOut"))
            .onUpdate(onUpdate)
            .chain(tweenScaleIn);
        tween.start();
    }

    delete() {
        this.mainController.spawnSingleObject();
        this.interactable.onHoverEnter.remove(this.listenForInteraction);

        this.animateOut();

        setTimeout(() => {
            try {
                if (this.selectedObject) {
                    this.selectedObject.destroy();
                }
            } catch {
                throw new Error('Could not delete the object.');
            }
            
        }, 500);
    }
}
