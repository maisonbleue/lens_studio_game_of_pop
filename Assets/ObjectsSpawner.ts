import { ScoreManager } from "ScoreManager";

@component
export class ObjectsSpawner extends BaseScriptComponent {
    private spawnedObject: any;
    private randomEnemy: number = Math.random();
    private selectedObject: SceneObject;
    private spawnPosition: vec3;

    @input
    scoreManager: ScoreManager;

    @input
    prefabBallon: ObjectPrefab;

    onAwake() {}
    onResolve = (tmp: any) => {
        // Assign the temporary object to the spawnedObject property
        this.spawnedObject = tmp;

        // Calculate a random index to activate one of the children
        var activateId = Math.floor(this.randomEnemy);
        this.spawnedObject.children[activateId].enabled = true;
        this.selectedObject = this.spawnedObject.children[activateId];

        // set Position to the object
        this.spawnedObject.getTransform().setWorldPosition(this.spawnPosition);
    }
    onReject = () => { print("Ballon Error"); }
    onProgress = () => { }
    spawn(parent: SceneObject, rand: number, position: vec3) {
        this.randomEnemy = rand;
        this.spawnPosition = position;
        this.prefabBallon.instantiateAsync(parent, this.onResolve, this.onReject, this.onProgress);
    }
    delete() {}
}
