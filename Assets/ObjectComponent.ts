import { Interactable } from "SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";
import { ScoreManager } from "ScoreManager";
import { MainController } from "MainController";
import { setTimeout } from "SpectaclesInteractionKit/Utils/debounce";
import WorldCameraFinderProvider from "SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider";

const GLOBAL_SCRIPT = global as any;

@component
export class ObjectComponent extends BaseScriptComponent {
    private worldCameraProvider = WorldCameraFinderProvider.getInstance();
    private cameraTransform: Transform = this.worldCameraProvider.getTransform();
    private interactable: Interactable;
    private selectedObject: SceneObject;
    private position: vec3;
    private userPosition: vec3;
    private objectSize: number = 10;

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
        
        this.createEvent('UpdateEvent').bind(this.onUpdate.bind(this));
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

    onUpdate() {
        if (this.selectedObject == null) return;
        this.position = this.selectedObject.getTransform().getWorldPosition();
        this.userPosition = this.cameraTransform.getWorldPosition();
    
        // Check if the object is colliding with the world mesh
        let isCollidingWithWorldMesh = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(
            this.position,
            this.position.add(new vec3(0, -this.objectSize, 0))
        ).isValid();
    
        // Check if the object is behind the world mesh
        let isBehindWorldMesh = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(
            this.position,
            this.userPosition
        ).isValid();
    
        // If the object is colliding or behind the world mesh, move it towards the user
        if (isCollidingWithWorldMesh || isBehindWorldMesh) {
            print("Object is colliding with the world mesh or behind the user");
            const directionToUser = this.userPosition.sub(this.position).normalize();
            const stepSize = 5; // Adjust step size as needed
    
            // Calculate deltaTime
            const deltaTime = GLOBAL_SCRIPT.getDeltaTime(); // Assuming a method to get deltaTime
    
            // Move the object towards the user using deltaTime
            this.position = this.position.add(directionToUser.uniformScale(stepSize * deltaTime));
            this.selectedObject.getParent().getTransform().setWorldPosition(this.position);
    
            // Re-check collision and behind status after moving
            isCollidingWithWorldMesh = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(
                this.position,
                this.position.add(new vec3(0, -this.objectSize, 0))
            ).isValid();
    
            isBehindWorldMesh = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(
                this.position,
                this.userPosition
            ).isValid();
    
            // If still colliding or behind, continue moving in the next update
        }
    }
    // onUpdate() {
    //     if (this.selectedObject == null) return;
    
    //     print("Updating object position");

    //     // Get the user's current position
    //     this.userPosition = this.cameraTransform.getWorldPosition();
    //     print("User position: " + this.userPosition);

    //     // Set the selected object's position to the user's position
    //     this.selectedObject.getParent().getTransform().setWorldPosition(new vec3(
    //         this.userPosition.x,
    //         0.0,
    //         this.userPosition.z
    //     ));
    // }
}
