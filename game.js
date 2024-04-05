class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.isJumping = false;
        this.jumpForce = -15;
        this.timeoutJump = {};
        this.move = true;
        this.gravityEnabled = true;
        this.isDashing = false;
        this.nbmove = 5;
        this.movingDroite = false;
        this.movingGauche = false;
        this.dashDirection = null;

    }

    /**
     * Dessine le joueur sur le canvas.
     * @param {CanvasRenderingContext2D} ctx - Le contexte de rendu du canvas.
     */
    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Permet de réinitialiser l'état de saut du joueur.
     */
    clearJump() {
        this.isJumping = false;
        clearTimeout(this.timeoutJump);
    }

    /**
     * Effectue les actions nécessaires lorsque le joueur meurt.
     */
    mort() {
        console.log("Le joueur est mort !");
    }

    /**
     * Permet au joueur d'effectuer un saut.
     */
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = this.jumpForce;
            this.timeoutJump = setTimeout(() => {
                this.isJumping = false;
            }, 200); // Limitez la durée du saut
        }
    }



    dash() {
        let nbDash = 100; // La distance que le joueur va parcourir lors du dash
        let dashDuration = 250; // Durée du dash en millisecondes
        let dashSpeed = nbDash / dashDuration; // Vitesse du dash
        let player = this;
        if (!player.isDashing) {
            player.isDashing = true;
            player.move = false;
            player.gravity = false;
            var initialX = player.x;
            var targetX = false === this.movingDroite ? player.x - nbDash : player.x + nbDash;

            this.dashDirection = this.movingDroite ? 'right' : 'left';


            var startTime = performance.now();

            const dashStep = (timestamp) => {
                var elapsedTime = timestamp - startTime;
                var progress = Math.min(elapsedTime / dashDuration, 1); // Progression du dash (de 0 à 1)
                var newX = initialX + progress * (targetX - initialX); // Calcul de la nouvelle position

                player.x = newX;
                console.log(progress);

                if (progress < 1) {
                    player.movingDroite = false
                    player.movingGauche = false
                    requestAnimationFrame((timestamp) => {
                        dashStep(timestamp);
                    }); // Continuer le dash jusqu'à ce que la progression atteigne 1
                } else {
                    player.isDashing = false; // Fin du dash
                    player.move = true;
                    player.gravity = true;
                }
            };
            requestAnimationFrame((timestamp) => {
                dashStep(timestamp);
            });
        }
    }


}

class Cube {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityY = 0;
        this.gravity = 0.5;
        this.gravityDirection = "down";
    }



    draw(ctx) {
        // Dessiner le cube sur le canvas
        ctx.fillStyle = 'red'; // Couleur de remplissage
        ctx.fillRect(this.x, this.y, this.width, this.height); // Rectangle représentant le cube
    }
}


class Platform {
    /**
     * Crée une instance de plateforme.
     * @param {number} x - La position horizontale de la plateforme.
     * @param {number} y - La position verticale de la plateforme.
     * @param {number} width - La largeur de la plateforme.
     * @param {number} height - La hauteur de la plateforme.
     */
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Dessine la plateforme sur le canvas.
     * @param {CanvasRenderingContext2D} ctx - Le contexte de rendu du canvas.
     */
    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

/**
 * Représente le jeu.
 */
class Game {
    /**
     * Crée une instance de jeu.
     */
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        this.player = new Player(50, 50, 30, 60); // Création d'une isntance de Player
        this.cube = new Cube(50, 50, 20, 20); // Création d'une instance de Cube

        this.platforms = [
            new Platform(150, 550, 300, 20),
            new Platform(400, 300, 300, 20)
        ];

        this.touchStartX = 0;
        this.touchEndX = 0;

        this.bindEvents();
        this.gameLoop();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);


        this.player.draw(this.ctx);
        this.cube.draw(this.ctx);

        this.platforms.forEach(platform => {
            platform.draw(this.ctx);
        });
    }

    /**
     * Met à jour le joueur dans le jeu.
     */
    updatePlayer() {
        // Votre logique de mise à jour du joueur ici
        let player = this.player;
        // Appliquer la gravité
        if (player.gravity) {
            player.velocityY += player.gravity;
            player.y += player.velocityY;
        }


        // Si le joueur touche le sol, réinitialiser la vélocité
        if (player.y + player.height >= this.canvasHeight) {
            player.velocityY = 0;
            player.y = this.canvasHeight - player.height;
        }

        // Vérifier les collisions avec les plateformes
        this.platforms.forEach(platform => {
            // Vérifier si le joueur touche le dessus de la plateforme
            if (player.y + player.height <= platform.y + platform.height &&
                player.y + player.height >= platform.y &&
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x) {
                player.velocityY = 0;
                player.y = platform.y - player.height;
                player.clearJump();
            } else if (player.y <= platform.y + platform.height &&
                player.y > platform.y &&
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x) {
                // Vérifier si le joueur touche le bas de la plateforme
                player.velocityY = 0;
                player.y = platform.y + platform.height;
            } else if (player.y + player.height > platform.y &&
                player.y < platform.y &&
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x) {
                // Vérifier si le joueur tombe sur la plateforme depuis le haut
                player.velocityY = 0;
                player.y = platform.y - player.height;
            } else {
                // Vérifier si le joueur touche le côté gauche de la plateforme
                if (player.x + player.width >= platform.x &&
                    player.x < platform.x &&
                    player.y < platform.y + platform.height &&
                    player.y + player.height > platform.y) {
                    player.x = platform.x - player.width;
                }

                // Vérifier si le joueur touche le côté droit de la plateforme
                if (player.x <= platform.x + platform.width &&
                    player.x > platform.x &&
                    player.y < platform.y + platform.height &&
                    player.y + player.height > platform.y) {
                    player.x = platform.x + platform.width;
                }
            }
        })

        // Si le joueur sort du canvas, activer la fonction de mort
        if (player.y > this.canvasHeight || player.y + player.height < 0) {
            mort();
        }

        if (player.movingDroite) {
            player.x += player.nbmove
        }
        if (player.movingGauche) {
            player.x -= player.nbmove
        }

    }

    updateCube() {

        if (this.cube.gravityDirection == "down") {
            this.cube.velocityY += this.cube.gravity;
            this.cube.y += this.cube.velocityY;

            if (this.cube.y + this.cube.height >= this.canvasHeight) {
                this.cube.velocityY = 0;
                this.cube.y = this.canvasHeight - this.cube.height;
            }

        }else if (this.cube.gravityDirection === 'up') {
            // Appliquer la gravité vers le haut
            this.cube.velocityY += this.cube.gravity;
            this.cube.y -= this.cube.velocityY;
            this.cube.velocityY = this.cube.velocityY / 1.1

        }



    }

    /**
     * Gère le mouvement du balayage sur l'écran tactile.
     */
    handleSwipe() {
        let swipeDistance = this.touchEndX - this.touchStartX;
        let minSwipeDistance = 50;
        if (swipeDistance > minSwipeDistance) {
            console.log("Balayage vers la droite détecté !");
            this.player.x = 250
        }
    }


    /**
     * Boucle de jeu principale.
     */
    gameLoop() {
        this.updatePlayer();
        this.updateCube();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }



    /**
     * Associe les événements aux gestionnaires d'événements appropriés.
     */
    bindEvents() {
        document.addEventListener("keydown", (e) => {
            console.log(this.cube.gravityDirection)

            if (this.player.move) { // Variable qui dit oui ou non l'utilisateur peut bouger.
                switch (e.key) {
                    case "z":
                    case " ":
                        this.player.jump(); // Jump
                        break;
                    case "s":
                        // Action pour descendre
                        break;
                    case "q":
                        this.player.movingGauche = true;
                        this.dashDirection = null; // Réinitialiser la direction du dash si la direction de déplacement change

                        break;
                    case "d":
                        this.player.movingDroite = true;
                        this.dashDirection = null; // Réinitialiser la direction du dash si la direction de déplacement change

                        break;
                    case "Shift":
                        this.player.dash() // dasho
                        break;

                    // Cube
                    case "u":
                        this.cube.gravityDirection = 'up';
                        break;
                    case "j":
                        this.cube.gravityDirection = 'down';
                        break;
                }
            }
        });

        //Lorsque on lache la touche
        document.addEventListener("keyup", (e) => {
            if (this.player.move) {
                switch (e.key) {
                    case "q":
                        this.player.movingGauche = false;
                        break;
                    case "d":
                        this.player.movingDroite = false;
                        break;
                }
            }
        });

        document.addEventListener('touchstart', (event) => {
            this.touchStartX = event.touches[0].clientX;
        });

        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });

        document.addEventListener('touchend', (event) => {
            this.touchEndX = event.changedTouches[0].clientX;
            this.handleSwipe();
        });
    }
}

// Démarrer le jeu lorsque la fenêtre est chargée
window.onload = function () {
    new Game();
};
