if(localStorage.getItem("username") == null) {
    document.location = 'index.html';
}

import * as THREE from './three.module.js';
import { PointerLockControls } from "./PointerLockControls.js";

let enemy;
let camera;
let controls;
let renderer;
const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();

let difficulty = 0;
let points = 0;
let lives = 10;

let hitsound = new Audio('sounds/hitsound.wav');

let canRestart = true;

let lossSounds = [
    new Audio('sounds/loss1.wav'),
    new Audio('sounds/loss2.wav'),
    new Audio('sounds/loss3.wav'),
    new Audio('sounds/loss4.wav'),
    new Audio('sounds/loss5.wav'),
    new Audio('sounds/loss6.wav'),
    new Audio('sounds/loss7.wav'),
    new Audio('sounds/loss8.wav'),
    new Audio('sounds/loss9.wav'),
    new Audio('sounds/loss10.wav'),
    new Audio('sounds/loss11.wav'),
    new Audio('sounds/loss12.wav'),
    new Audio('sounds/loss13.wav')
];

let winSounds = [
    new Audio('sounds/win1.wav'),
    new Audio('sounds/win2.wav'),
    new Audio('sounds/win3.wav'),
    new Audio('sounds/win4.wav'),
    new Audio('sounds/win5.wav')
];

function randomPosNeg(max) {
    return Math.random() * Math.ceil(Math.random() * max) * (Math.round(Math.random()) ? 1 : -1);
}

function randomBetween(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function getEnemy(intersects) {
    for(const intersect of intersects) {
        if(intersect.object.name === "enemy") {
            return intersect;
        }
    }
    return null;
}

function killEnemy() {
    difficulty++;
    points += 10;
    if(points === 2500) {
        win();
    }
    scene.remove(enemy);
}

function spawnEnemy() {
    enemy = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshNormalMaterial());
    enemy.castShadow = true;
    enemy.name = "enemy";
    enemy.position.set(randomPosNeg(10) / 10, randomBetween(2, 10) / 10, Math.max(-randomBetween(10, 20) / 10, -2));
    scene.add(enemy);
}

function hurt() {
    document.getElementById("hit").style.color = "red";
    document.getElementById("hit").style.display = "";
    document.getElementById("hit").innerHTML = "Miss!<br>-10";
    setTimeout(() => {
        document.getElementById("hit").style.display = "none";
    }, 200);
    document.getElementById("hurt").style.backgroundColor = "rgba(255, 0, 0, 0.25)";
    setTimeout(() => {
        if(lives !== 0) {
            document.getElementById("hurt").style.backgroundColor = "transparent";
        }
    }, 200);
    lives--;
    points -= 10;
    new Audio('sounds/oof.mp3').play();

    if(lives === 0) {
        document.getElementById("crosshair").style.display = "none";
        document.getElementById("hit").style.display = "none";
        document.getElementById("hurt").style.backgroundColor = "rgba(255, 0, 0, 0.25)";
        document.getElementById("notification").innerHTML = "<h1>GAME OVER</h1>"
        controls.freeze();
        const sound = lossSounds[Math.floor(Math.random() * lossSounds.length)];
        canRestart = false;
        sound.play();
        setTimeout(() => {
            canRestart = true;
            document.getElementById("notification").innerHTML = "<h1>GAME OVER</h1><h5>Press R to restart</h5>"
        }, sound.duration * 1000);
    }
}

function win() {
    document.getElementById("crosshair").style.display = "none";
    document.getElementById("hit").style.display = "none";
    document.getElementById("hurt").style.backgroundColor = "rgba(0, 255, 100, 0.25)";
    document.getElementById("notification").innerHTML = "<h1 style='color: green'>YOU WIN</h1>"
    controls.freeze();
    const sound = winSounds[Math.floor(Math.random() * winSounds.length)];
    canRestart = false;
    sound.play();
    setTimeout(() => {
        canRestart = true;
        document.getElementById("notification").innerHTML = "<h1 style='color: green'>YOU WIN</h1><h5 style='color: green'>Press R to restart</h5>"
    }, sound.duration * 1000);
}

function restart() {
    killEnemy();
    difficulty = 0;
    points = 0;
    lives = 10;
    spawnEnemy();
    camera.quaternion.setFromEuler(new THREE.Euler( 0, 0, 0, 'YXZ' ));
    document.getElementById("hurt").style.backgroundColor = "transparent";
    document.getElementById("notification").innerHTML = ""
    document.getElementById("crosshair").style.display = "";
    controls.unfreeze();
}

function init() {
    // set up scene
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 1, 5);

    // set up skybox
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // set up light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // create ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false}));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // set up camera
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.set(0, 0.2, 0);

    // set up controls
    controls = new PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    // create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.setAnimationLoop(() => {
        if(controls.isLocked && !controls.isFrozen) {

            const scaleChange = 0.005 * difficulty;

            enemy.scale.x -= scaleChange;
            enemy.scale.y -= scaleChange;
            enemy.scale.z -= scaleChange;

            if(enemy.scale.x <= 0.0) {
                scene.remove(enemy);
                spawnEnemy();
                hurt();
            }
        }
        let hearts = "";
        for(let i = 0; i < lives; i++) {
            hearts += "<img src='images/heart.png'> ";
        }
        for(let i = lives; i < 10; i++) {
            hearts += "<img src='images/noheart.png'> ";
        }

        document.getElementById("stats").innerHTML = hearts + "<br>Points: " + points;

        renderer.render(scene, camera);
    });
    document.body.appendChild(renderer.domElement);

    // fix resizing issues
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    });

    controls.addEventListener('lock', () => {
        if(lives !== 0) {
            document.getElementById("crosshair").style.display = "";
        }
        document.getElementById("stats").style.display = "";
        document.getElementById("menu").style.display = "none";
    });

    controls.addEventListener('unlock', () => {
        document.getElementById("crosshair").style.display = "none";
        document.getElementById("stats").style.display = "none";
        document.getElementById("menu").style.display = "";
    });

    spawnEnemy();
    renderer.render(scene, camera);
}

init();

document.getElementById("play").addEventListener('click', () => {
    controls.lock();
});

document.getElementById("back").addEventListener('click', () => {
    document.location = "index.html";
});

window.addEventListener('mousedown', () => {
    if(controls.isLocked && !controls.isFrozen) {
        raycaster.setFromCamera(scene.position, camera);

        const intersect = getEnemy(raycaster.intersectObject(enemy));
        if(intersect != null) {
            killEnemy();
            hitsound.play();
            spawnEnemy();
            document.getElementById("hit").style.color = "gold";
            document.getElementById("hit").style.display = "";
            document.getElementById("hit").innerHTML = "Hit!<br>+10";
            setTimeout(() => {
                document.getElementById("hit").style.display = "none";
            }, 200);
        }else {
            hurt();
        }
    }
});

document.addEventListener("keydown", event => {
    if(event.key.toLowerCase() === "r" && controls.isLocked && canRestart) {
        restart();
    }
})
