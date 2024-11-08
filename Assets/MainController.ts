import { ObjectsSpawner } from "./ObjectsSpawner";
import { setTimeout } from "SpectaclesInteractionKit/Utils/debounce";
import { ScoreManager } from "ScoreManager";
import WorldCameraFinderProvider from "SpectaclesInteractionKit/Providers/CameraProvider/WorldCameraFinderProvider";

const GAME_TIMER: number = 30;
const GLOBAL_SCRIPT = global as any;

@component
export class MainController extends BaseScriptComponent {
    private worldCameraProvider = WorldCameraFinderProvider.getInstance();
    private cameraTransform: Transform = this.worldCameraProvider.getTransform();
    private difficulty: number = 0.8;
    private timer: number = GAME_TIMER;
    private gameIsOn: boolean = false;
    private userPosition: vec3;

    @input
    menuAudio: AudioComponent;

    @input
    gameLoopAudio: AudioComponent;

    @input
    gameMusic: AudioComponent;

    @input
    timerAudio: AudioComponent;

    @input
    counterText: Text;

    @input
    timerText: Text;

    @input
    uiTimer: Text;

    @input
    gameMenu: SceneObject;

    @input
    counter: SceneObject;

    @input
    gameScene: SceneObject;

    @input
    objectsSpawner: ObjectsSpawner;

    @input
    scoreManager: ScoreManager;

    private spawnedObjects: vec3[] = [];

    getRandomZero() {
        return Math.random() < this.difficulty ? 0 : 1; // Returns 0 20% of the time, otherwise returns 1
    }

    // spawnGameObjects() {
    //     if (!this.gameIsOn) return;
    
    //     const spawnInterval = 1000; // 1 second
    //     const spawnObjects = () => {
    //         if (!this.gameIsOn) return;
    
    //         const objectsToSpawn = Math.floor(Math.random() * 3) + 1; // Randomly spawn 1 to 3 objects
    //         for (let i = 0; i < objectsToSpawn; i++) {
    //             this.spawnSingleObject();
    //         }
    
    //         setTimeout(spawnObjects, spawnInterval);
    //     };
    
    //     spawnObjects();
    // }

    spawnGameObjects() {
        for (var i = 0; i < 25; i++) {
            setTimeout(() => {
                this.spawnSingleObject(); // Call spawnSingleObject instead of duplicating logic
            }, i * 100); // Delay each spawn by 100ms
        }
    }

    toggleMenuAudio(start, end, startAudio) {
        var startValue = { x: start };
        var endValue = { x: end };

        var onUpdate = (value) => {
            this.menuAudio.volume = value.x;
        }

        var onComplete = () => {
            if (startAudio) {
                this.menuAudio.stop(true);
            } else {
                this.menuAudio.play(1);
            }
        };

        var tween = new GLOBAL_SCRIPT.TWEEN.Tween(startValue)
            .to(endValue, 0.5 * 1000.0)
            .easing(GLOBAL_SCRIPT.tweenManager.getTweenEasingType("Linear", "InOut"))
            .onUpdate(onUpdate)
            .onComplete(onComplete);
        tween.start();
    }

    // Function to check if an object is colliding with the world mesh
    isObjectCollidingWithWorldMesh(objectPosition, objectSize) {
        // Define the start and end points for the raycast
        var from = objectPosition;
        var to = objectPosition.add(new vec3(0, -objectSize, 0)); // Assuming downward raycast

        // Perform the raycast
        var hitTestResult = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(from, to);

        // Check if the result is valid
        return hitTestResult.isValid();
    }

    multiplyVectorByScalar(vector: vec3, scalar: number): vec3 {
        return new vec3(
            vector.x * scalar,
            vector.y * scalar,
            vector.z * scalar
        );
    }
    
    // spawnSingleObject() {
    //     if (!this.gameIsOn) return;
    //     this.userPosition = this.cameraTransform.getWorldPosition();
    //     let position: vec3;
    //     let isOverlapping: boolean;
    //     let isCollidingWithWorldMesh: boolean;
    //     const minDistance = 100; // Minimum distance from userPosition
    //     const maxDistance = 200; // Maximum distance from userPosition
    
    //     do {
    //         // Correctly calculate the forward direction from the camera's transform
    //         const forwardDirection = this.cameraTransform.back.normalize();
    
    //         const randomDistance = minDistance + Math.random() * (maxDistance - minDistance); // Random distance between min and max
    
    //         // Introduce randomness to the horizontal plane
    //         const angleOffset = (Math.random() - 0.5) * Math.PI / 4; // Random angle offset within ±22.5 degrees
    //         const cosOffset = Math.cos(angleOffset);
    //         const sinOffset = Math.sin(angleOffset);
    
    //         // Rotate the forward direction by the angle offset
    //         const rotatedForward = new vec3(
    //             forwardDirection.x * cosOffset - forwardDirection.z * sinOffset,
    //             forwardDirection.y,
    //             forwardDirection.x * sinOffset + forwardDirection.z * cosOffset
    //         );
    
    //         // Perform scalar multiplication manually
    //         const scaledForward = new vec3(
    //             rotatedForward.x * randomDistance,
    //             rotatedForward.y * randomDistance,
    //             rotatedForward.z * randomDistance
    //         );
    
    //         // Ensure objects spawn in front of the user
    //         position = this.userPosition.add(scaledForward);
    
    //         // Randomize the y position slightly to add variation
    //         position.y += (Math.random() - 0.5) * 100;
    //         position.x += (Math.random() - 0.5) * 100;
    //         position.z += (Math.random() - 0.5) * 100;
    
    //         const distanceFromUser = this.userPosition.distance(position);
    
    //         isOverlapping = distanceFromUser < minDistance || this.spawnedObjects.some(existingPosition => 
    //             this.isOverlapping(existingPosition, position)
    //         );
    
    //         // Perform the raycast to check for collision
    //         const hitTestResult = GLOBAL_SCRIPT.WorldMeshController.getHitTestResult3D(position, position.add(new vec3(0, -10, 0)));
    //         isCollidingWithWorldMesh = hitTestResult.isValid();
    
    //         // If colliding, adjust the position to the collision point
    //         if (isCollidingWithWorldMesh) {
    //             const classification = hitTestResult.getClassification();
    //             const collisionPoint = hitTestResult.getWorldPos();
    //             const directionToUser = this.userPosition.sub(collisionPoint).normalize();
    //             let distanceToUser = 100;
    //             if (classification === 2 || classification === 3) {
    //                 distanceToUser = 200 + Math.random() * 100;
    //             }
    
    //             // Perform scalar multiplication manually
    //             const scaledDirection = new vec3(
    //                 directionToUser.x * distanceToUser,
    //                 directionToUser.y * distanceToUser,
    //                 directionToUser.z * distanceToUser
    //             );
    
    //             position = collisionPoint.add(scaledDirection);
    //         }
    //     } while (isOverlapping); // Only check for overlap, as collision is handled
    
    //     if (!this.gameIsOn) return;
    //     this.objectsSpawner.spawn(this.gameScene, this.getRandomZero(), position);
    //     this.spawnedObjects.push(position); // Save the position of the spawned object
    // }

    spawnSingleObject() {
        if (!this.gameIsOn) return;
        let x: number;
        let y: number;
        let z: number;
        let position: vec3;
        let isOverlapping: boolean;
        let isCollidingWithWorldMesh: boolean;
        const minDistance = 100; // Minimum distance from userPosition
        const maxDistance = 200; // Maximum distance from userPosition
    
        do {
            const randomDirection = Math.random() * 2 * Math.PI; // Random angle in radians
            const randomDistance = minDistance + Math.random() * (maxDistance - minDistance); // Random distance between min and max
    
            x = this.userPosition.x + Math.cos(randomDirection) * randomDistance;
            y = this.userPosition.y + (Math.random() - 0.5) * 100;
            z = this.userPosition.z + Math.sin(randomDirection) * randomDistance;
            position = new vec3(x, y, z);
    
            const distanceFromUser = Math.sqrt(
                Math.pow(this.userPosition.x - position.x, 2) +
                Math.pow(this.userPosition.y - position.y, 2) +
                Math.pow(this.userPosition.z - position.z, 2)
            );
    
            isOverlapping = distanceFromUser < minDistance || this.spawnedObjects.some(existingPosition => 
                this.isOverlapping(existingPosition, position)
            );
    
            // Check for collision with the world mesh
            isCollidingWithWorldMesh = this.isObjectCollidingWithWorldMesh(position, 10); // Assuming object size is 10
    
        } while (isOverlapping || isCollidingWithWorldMesh); // Ensure no overlap or collision
    
        if (!this.gameIsOn) return;
        this.objectsSpawner.spawn(this.gameScene, this.getRandomZero(), position);
        this.spawnedObjects.push(position); // Save the position of the spawned object
    }

    private isOverlapping(pos1: vec3, pos2: vec3): boolean {
        const distance = Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
        return distance < 10; // Assuming 10 is the minimum distance to avoid overlap
    }

    resetGame() {
        this.gameScene.children.forEach(child => {
            print("Destroying " + child.name);
            child.children.forEach(grandchild => {
                if (grandchild) { grandchild.destroy(); }
            });
            if (child) { child.destroy(); }
        });
    }
   
    gameOver() {
        print("Game over!");
        this.gameScene.children.forEach(child => {
            print("Destroying " + child.name);
            child.children.forEach(grandchild => {
                if (grandchild) { grandchild.enabled = false; }
            });
            if (child) { child.enabled = false; }
        });
        this.toggleMenuAudio(0.0, 0.25, false);
        this.gameMenu.enabled = true;
    }

    timerStart() {
        setTimeout(() => {
            this.timer--;
            this.timerText.text = `00:${this.timer < 10 ? '0' + this.timer : this.timer}`;
            this.uiTimer.text = `00:${this.timer < 10 ? '0' + this.timer : this.timer}`;
            if (this.timer > 0) {
                this.timerStart();
            } else {
                this.gameIsOn = false;
                this.gameOver();
            }
        }, 1000)
    }

    gameStart() {
        this.gameMenu.enabled = false;
        this.counterText.text = "3";
        this.counter.enabled = true;
        this.timerAudio.play(1);
        this.resetGame();
        this.toggleMenuAudio(0.25, 0.0, true);
        setTimeout(() => {
            this.counterText.text = "2";
            setTimeout(() => {
                this.counterText.text = "1";
                setTimeout(() => {
                    this.counter.enabled = false;
                    this.gameIsOn = true;
                    this.timer = GAME_TIMER;
                    this.timerText.text = `00:${this.timer}`;
                    this.uiTimer.text = `00:${this.timer}`;
                    this.timerStart();
                    this.gameLoopAudio.play(1);
                    this.gameMusic.play(1);
                    this.scoreManager.resetScore();
                    this.cameraTransform = this.worldCameraProvider.getTransform();
                    this.userPosition = this.cameraTransform.getWorldPosition();
                    this.spawnGameObjects();
                }, 1000)
            }, 1000)
        }, 1000)
    }

    onAwake() {}
}