let Arrow1 = null;
let planets = [];
let players = [];  // 두 플레이어를 위한 리스트
let PlayerRadius = 20;  // 초기 플레이어 반지름
let isAiming = false;
let startCoord = null;
let gval = 100;
let dt = 0.5;  // 시간 간격 설정
let stars_positions = [];
let traj_num = 50;
let traj_density = 4;
let current_turn = 1;
let game_ended = false;
let score = [0, 0];
let button_x = 540, button_y = 400, button_w = 200, button_h = 50;  // Next Round 버튼 위치 및 크기
let button_hover = false;
let Agree1 = false;
let Agree2 = false;
let Agree1_x = 70, Agree1_y = 170, Agree1_w = 100, Agree1_h = 50;
let Agree2_x = 1110, Agree2_y = 170, Agree2_w = 100, Agree2_h = 50;
let Agree1_hover = false;
let Agree2_hover = true;
let waitframe = 0;

let isGoalseeking = false;
let best_trajectory = [];
let goal_seek_velocity = null;
let goal_seek_angle = 0;
let goal_seek_iterations = 0;
let max_iterations = 300000;  // Limit to avoid infinite loops
let showgoalseek = false;
let SolutionFound = false;

let Menu = true;
let vsPlayer = false;
let vsComputer = false;
let vsPl_x = 640, vsPl_y = 400, vsPl_w = 250, vsPl_h = 75;
let vsCo_x = 640, vsCo_y = 500, vsCo_w = 250, vsCo_h = 75;
let BackMenu_x = 100, BackMenu_y = 100, BackMenu_w = 170, BackMenu_h = 70;

function setup() {
    createCanvas(1280, 900);
    initialize_game();
    for (let i = 0; i < 200; i++) {
        stars_positions.push(createVector(random(0, width), random(0, height)));
    }
}

function initialize_game() {
    Agree1 = false;
    Agree2 = false;
    isGoalseeking = false;
    waitframe = 0;
    planets = [];
    players = [];
    Arrow1 = null;
    isAiming = false;
    startCoord = null;
    game_ended = false;
    best_trajectory = [];
    initialize_planets();
    initialize_players();
}

function initialize_planets() {
    planets = [];  // 행성 리스트 초기화
    let num_planets = 4;
    let max_tries = 200;  // 최대 시도 횟수 설정

    for (let i = 0; i < num_planets; i++) {
        let valid = false;
        let tries = 0;

        while (!valid && tries < max_tries) {
            let coord = createVector(random(250, width - 250), random(250, height - 250));
            let radius = random(125, 200);
            let mass = radius * radius / 100;
            let col = [random(150, 250), random(150, 250), random(150, 250)];
            let new_planet = new Planets(coord, radius, mass, col);

            valid = true;

            // 기존 행성과 겹치는지 확인
            for (let existing_planet of planets) {
                let min_distance = (existing_planet.radius / 2) + (new_planet.radius / 2) + 10;  // 최소 거리 계산
                if (existing_planet.coord.dist(new_planet.coord) < min_distance) {
                    valid = false;
                    break;
                }
            }

            if (valid) {
                planets.push(new_planet);  // 겹치지 않으면 리스트에 추가
            }

            tries++;
        }

        if (tries >= max_tries && !valid) {
            console.log("Failed to place planet! Reinitializing game.");
            initialize_game();
            return;
        }
    }
}

function initialize_players() {
    players = [];

    if (vsPlayer) {
        for (let i = 0; i < 2; i++) {
            let valid = false;
            let tries = 0;
            let latitude = 0;
            let planet = planets[i];  // 플레이어가 설 행성 선택

            while (!valid && tries < 200) {
                latitude = random(-PI, PI);

                // 플레이어 위치 계산
                let player_position = createVector(
                    planet.coord.x + cos(latitude) * (planet.radius / 2 + PlayerRadius),
                    planet.coord.y + sin(latitude) * (planet.radius / 2 + PlayerRadius)
                );

                valid = true;

                // 다른 행성과 겹치는지 확인
                for (let other_planet of planets) {
                    if (other_planet !== planet) {
                        let min_distance = (other_planet.radius / 2) + PlayerRadius + 10;
                        if (player_position.dist(other_planet.coord) < min_distance) {
                            valid = false;
                            break;
                        }
                    }
                }

                tries++;
            }

            if (tries >= 200 && !valid) {
                console.log("Failed to place player! Reinitializing game.");
                initialize_game();
                return;
            } else {
                // 유효한 위도를 사용하여 플레이어 생성
                players.push(new Player(planet, latitude, PlayerRadius));
            }
        }
    } else if (vsComputer) {
        // 플레이어 1 생성
        let valid = false;
        let tries = 0;
        let latitude = 0;
        let planet = planets[0];  // 첫 번째 행성 선택

        while (!valid && tries < 200) {
            latitude = random(-PI, PI);

            let player_position = createVector(
                planet.coord.x + cos(latitude) * (planet.radius / 2 + PlayerRadius),
                planet.coord.y + sin(latitude) * (planet.radius / 2 + PlayerRadius)
            );

            valid = true;

            for (let other_planet of planets) {
                if (other_planet !== planet) {
                    let min_distance = (other_planet.radius / 2) + PlayerRadius + 10;
                    if (player_position.dist(other_planet.coord) < min_distance) {
                        valid = false;
                        break;
                    }
                }
            }

            tries++;
        }

        if (tries >= 200 && !valid) {
            console.log("Failed to place player! Reinitializing game.");
            initialize_game();
            return;
        } else {
            players.push(new Player(planet, latitude, PlayerRadius));
        }

        // 컴퓨터 플레이어 생성
        valid = false;
        tries = 0;
        latitude = 0;
        planet = planets[planets.length - 1];  // 마지막 행성 선택

        while (!valid && tries < 200) {
            latitude = random(-PI, PI);

            let computer_position = createVector(
                planet.coord.x + cos(latitude) * (planet.radius / 2 + PlayerRadius),
                planet.coord.y + sin(latitude) * (planet.radius / 2 + PlayerRadius)
            );

            valid = true;

            for (let other_planet of planets) {
                if (other_planet !== planet) {
                    let min_distance = (other_planet.radius / 2) + PlayerRadius + 10;
                    if (computer_position.dist(other_planet.coord) < min_distance) {
                        valid = false;
                        break;
                    }
                }
            }

            tries++;
        }

        if (tries >= 200 && !valid) {
            console.log("Failed to place computer player! Reinitializing game.");
            initialize_game();
            return;
        } else {
            players.push(new Player(planet, latitude, PlayerRadius));
        }
    }
}

function keyPressed() {
    if (Menu) {
        return;
    }
    if (key === 'q' && (Arrow1 === null || Arrow1.stopped(planets)) && !isGoalseeking) {
        isGoalseeking = true;
        goal_seek_velocity = createVector(5, 0);
        goal_seek_angle = 0;
        goal_seek_iterations = 0;
    } else if (key === 'e' && !isGoalseeking && goal_seek_velocity !== null && (Arrow1 === null || Arrow1.stopped(planets))) {
        let player_position = players[current_turn].position.copy();
        Arrow1 = new Arrow(player_position, goal_seek_velocity.copy(), goal_seek_velocity.heading());
        current_turn = (current_turn + 1) % players.length;
    } else if (key === 'z' && isAiming) {
        isAiming = false;
        startCoord = null;
    } else if (key === 't') {
        showgoalseek = !showgoalseek;
    }
}

function display_trajectory(start_pos, initial_velocity) {
    let temp_coord = start_pos.copy();
    let temp_velocity = initial_velocity.copy();
    let trajectory_dt = dt * 0.5;
    fill(255, 255, 0);
    noStroke();
    for (let i = 0; i < traj_num; i++) {
        let accel = createVector(0, 0);
        for (let planet of planets) {
            let direction = p5.Vector.sub(planet.coord, temp_coord);
            let distanceSq = direction.magSq();
            let forceMagnitude = planet.mass / distanceSq;
            let force = direction.normalize().mult(forceMagnitude);
            accel.add(force.mult(gval));
        }
        temp_velocity.add(accel.mult(trajectory_dt));
        temp_coord.add(p5.Vector.mult(temp_velocity, trajectory_dt));
        if (i % traj_density === 0) {
            circle(temp_coord.x, temp_coord.y, 6);
        }
        for (let planet of planets) {
            if (temp_coord.dist(planet.coord) <= planet.radius / 2) {
                return;
            }
        }
    }
}

function goalseek(hitboxw = 0.3, hitboxh = 1.1) {
    if (!isGoalseeking || goal_seek_iterations >= max_iterations) {
        isGoalseeking = false;
        return;
    }
    let target_player = players[(current_turn + 1) % players.length];
    let player_position = players[current_turn].position.copy();

    let min_distance = Infinity;
    let best_initial_velocity = null;
    best_trajectory = [];

    let speeds = [];
    for (let i = 4; i <= 50; i += 5) {
        speeds.push(i);
    }
    let angles = [];
    for (let i = 0; i < 720; i++) {
        angles.push(radians(i * 0.5));
    }
    let total_iterations = 0;

    for (let speed of speeds) {
        for (let angle of angles) {
            if (total_iterations >= speeds.length * angles.length) {
                isGoalseeking = false;
                return;
            }
            let initial_velocity = p5.Vector.fromAngle(angle).mult(speed);
            let temp_coord = player_position.copy();
            let temp_velocity = initial_velocity.copy();
            let trajectory = [];
            let valid_trajectory = true;

            let angle_offset = atan2(sin(target_player.latitude), cos(target_player.latitude));
            let ellipse_width = target_player.radius * hitboxh;
            let ellipse_height = target_player.radius * hitboxw;

            for (let j = 0; j < traj_num * 1000; j++) {
                if (!valid_trajectory) {
                    break;
                }

                let accel = createVector(0, 0);
                for (let planet of planets) {
                    let direction = p5.Vector.sub(planet.coord, temp_coord);
                    let distanceSq = direction.magSq();
                    let forceMagnitude = planet.mass / distanceSq;
                    let force = direction.normalize().mult(forceMagnitude);
                    accel.add(force.mult(gval));
                }

                temp_velocity.add(accel.mult(dt));
                temp_coord.add(p5.Vector.mult(temp_velocity, dt));
                trajectory.push(temp_coord.copy());

                let dx = temp_coord.x - target_player.position.x;
                let dy = temp_coord.y - target_player.position.y;
                let rotated_x = cos(angle_offset) * dx + sin(angle_offset) * dy;
                let rotated_y = -sin(angle_offset) * dx + cos(angle_offset) * dy;
                if ((rotated_x ** 2) / (ellipse_width ** 2) + (rotated_y ** 2) / (ellipse_height ** 2) <= 1) {
                    goal_seek_velocity = initial_velocity.copy();
                    best_trajectory = trajectory.slice();
                    console.log("solution found!");
                    isGoalseeking = false;
                    SolutionFound = true;
                    return;
                }

                for (let planet of planets) {
                    if (temp_coord.dist(planet.coord) <= planet.radius / 2) {
                        valid_trajectory = false;
                        break;
                    }
                }
                if (temp_coord.x > width * 2 || temp_coord.x < -width || temp_coord.y > height * 2 || temp_coord.y < -height) {
                    valid_trajectory = false;
                    break;
                }
            }

            if (valid_trajectory) {
                let distance_to_target = temp_coord.dist(target_player.position);
                if (distance_to_target < min_distance) {
                    min_distance = distance_to_target;
                    best_initial_velocity = initial_velocity.copy();
                    best_trajectory = trajectory.slice();
                }
                total_iterations += 1;
            }
        }
    }

    if (best_initial_velocity !== null) {
        goal_seek_velocity = best_initial_velocity;
        console.log("maybe fail");
    }
    console.log("finished");
    isGoalseeking = false;
    SolutionFound = true;
}

function computerTurn() {
    if (waitframe > 10) {
        if (!SolutionFound && !isGoalseeking) {
            isGoalseeking = true;
            goalseek(0.3, 0.3);
        }

        if (SolutionFound && goal_seek_velocity !== null) {
            let computer_position = players[current_turn].position.copy();
            Arrow1 = new Arrow(computer_position, goal_seek_velocity.mult(random(0.97, 1.03)), goal_seek_velocity.heading());
            SolutionFound = false;
            goal_seek_velocity = null;
            current_turn = 1 - current_turn;
        }
    }
}

function display_trajectory_with_goalseek() {
    if (showgoalseek) {
        noStroke();
        fill(0, 255, 0);
        for (let point of best_trajectory) {
            circle(point.x, point.y, 6);
        }
    }
}

function draw() {
    background(0);

    waitframe += 1;
    if (Menu) {
        rectMode(CENTER);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(50);
        text("NOT ORBIT", width / 2, 100);

        for (let pos of stars_positions) {
            fill(255);
            noStroke();
            circle(pos.x, pos.y, 2);
        }

        if (vsPl_x - vsPl_w / 2 < mouseX && mouseX < vsPl_x + vsPl_w / 2 && vsPl_y - vsPl_h / 2 < mouseY && mouseY < vsPl_y + vsPl_h / 2) {
            fill(175);
        } else {
            fill(220);
        }
        rect(vsPl_x, vsPl_y, vsPl_w, vsPl_h);
        fill(0);
        textSize(20);
        text("2 Player", vsPl_x, vsPl_y);

        if (vsCo_x - vsCo_w / 2 < mouseX && mouseX < vsCo_x + vsCo_w / 2 && vsCo_y - vsCo_h / 2 < mouseY && mouseY < vsCo_y + vsCo_h / 2) {
            fill(175);
        } else {
            fill(220);
        }
        rect(vsCo_x, vsCo_y, vsCo_w, vsCo_h);
        fill(0);
        textSize(20);
        text("1 Player", vsCo_x, vsCo_y);
        rectMode(CORNER);

        return;
    }

    for (let pos of stars_positions) {
        fill(255);
        noStroke();
        circle(pos.x, pos.y, 2);
    }

    for (let planet of planets) {
        planet.display();
    }

    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        player.update_position();
        player.display(i === current_turn);
    }

    if (isAiming && startCoord !== null) {
        let player_position = players[current_turn].position;
        stroke(255, 0, 0);
        line(startCoord.x, startCoord.y, mouseX, mouseY);
        noStroke();
        let endCoord = createVector(mouseX, mouseY);
        let initial_velocity = p5.Vector.sub(endCoord, startCoord).mult(-0.055);
        display_trajectory(player_position, initial_velocity);
    }

    if (isGoalseeking) {
        goalseek();
    }

    if (Arrow1 === null || (Arrow1 !== null && Arrow1.stopped(planets) && showgoalseek)) {
        display_trajectory_with_goalseek();
    }

    if (Arrow1 !== null) {
        Arrow1.gravity(planets);
        Arrow1.display();
        rectMode(CORNER);
        let speedMag = Arrow1.getv().mag();
        let kinetic_energy = 0.3 * speedMag * speedMag * 0.5;
        fill(255, 255, 0);
        rect(width - 360, 100, 30, kinetic_energy);
        textSize(12);
        text("Kinetic", width - 343, 80);
        display_arrow_outside_view(Arrow1);

        let potential_total = 0;
        fill(255, 255, 0);
        for (let planet of planets) {
            let potential_energy = -0.3 * planet.getMass() / Arrow1.getcoord().dist(planet.getcoord()) * gval;
            potential_total += potential_energy;
            rect(width - 300 + planets.indexOf(planet) * 60, 100, 30, potential_energy);
            text("Potential", width - 283 + planets.indexOf(planet) * 60, 120);
        }

        let total_energy = kinetic_energy + potential_total;
        rect(width - 65, 100, 30, total_energy);
        if (total_energy < 0) {
            text("Total", width - 260 + 3.5 * 60, 120);
        } else {
            text("Total", width - 260 + 3.5 * 60, 80);
        }
        rectMode(CENTER);
        if (Arrow1.check_collision_with_players(players)) {
            Arrow1 = null;
        }
    }

    fill(255, 100, 100);
    textAlign(CENTER);
    textSize(30);
    text(score[0] + " : " + score[1], width / 2, 50);
    rectMode(CORNER);
    if (Agree1_x < mouseX && mouseX < Agree1_x + Agree1_w && Agree1_y < mouseY && mouseY < Agree1_y + Agree1_h) {
        fill(200, 75, 75);
        rect(Agree1_x, Agree1_y, Agree1_w, Agree1_h);
    } else {
        fill(250, 100, 100);
        rect(Agree1_x, Agree1_y, Agree1_w, Agree1_h);
    }
    if (Agree2_x < mouseX && mouseX < Agree2_x + Agree2_w && Agree2_y < mouseY && mouseY < Agree2_y + Agree2_h) {
        fill(200, 75, 75);
        rect(Agree2_x, Agree2_y, Agree2_w, Agree2_h);
    } else {
        fill(250, 100, 100);
        rect(Agree2_x, Agree2_y, Agree2_w, Agree2_h);
    }
    fill(255);
    textSize(15);
    if (!Agree1) {
        text("Skip Agree", Agree1_x + Agree1_w / 2, Agree1_y + Agree1_h / 2 + 5);
    } else if (Agree1) {
        text("Agreed", Agree1_x + Agree1_w / 2, Agree1_y + Agree1_h / 2 + 5);
    }
    if (!Agree2) {
        text("Skip Agree", Agree2_x + Agree1_w / 2, Agree1_y + Agree1_h / 2 + 5);
    } else if (Agree2) {
        text("Agreed", Agree2_x + Agree1_w / 2, Agree1_y + Agree1_h / 2 + 5);
    }
    rectMode(CENTER);
    if (Agree1 && Agree2) {
        game_ended = true;
    }

    if (BackMenu_x - BackMenu_w / 2 < mouseX && mouseX < BackMenu_x + BackMenu_w / 2 && BackMenu_y - BackMenu_h / 2 < mouseY && mouseY < BackMenu_y + BackMenu_h / 2) {
        fill(175);
    } else {
        fill(220);
    }
    rect(BackMenu_x, BackMenu_y, BackMenu_w, BackMenu_h);
    fill(0);
    textSize(22);
    text("Back to Menu", BackMenu_x, BackMenu_y + 7);

    if (game_ended) {
        fill(200, 50, 50);
        rectMode(CORNER);
        if (button_x < mouseX && mouseX < button_x + button_w && button_y < mouseY && mouseY < button_y + button_h) {
            fill(75, 200, 75);
            rect(button_x, button_y, button_w, button_h);
        } else {
            fill(100, 230, 100);
            rect(button_x, button_y, button_w, button_h);
        }
        rectMode(CENTER);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(18);
        text("Next Round", button_x + button_w / 2, button_y + button_h / 2);
    }

    if (vsComputer && current_turn === 0 && (Arrow1 === null || Arrow1.stopped(planets)) && !isGoalseeking && !game_ended) {
        computerTurn();
    }
}

function mousePressed() {
    if (Menu) {
        if (vsPl_x - vsPl_w / 2 < mouseX && mouseX < vsPl_x + vsPl_w / 2 && vsPl_y - vsPl_h / 2 < mouseY && mouseY < vsPl_y + vsPl_h / 2) {
            Menu = false;
            vsPlayer = true;
            vsComputer = false;
            current_turn = 1;
            score = [0, 0];
            initialize_game();
        } else if (vsCo_x - vsCo_w / 2 < mouseX && mouseX < vsCo_x + vsCo_w / 2 && vsCo_y - vsCo_h / 2 < mouseY && mouseY < vsCo_y + vsCo_h / 2) {
            Menu = false;
            vsPlayer = false;
            vsComputer = true;
            current_turn = 1;
            score = [0, 0];
            initialize_game();
        }
        return;
    }
    if (!game_ended) {
        if ((Arrow1 === null) || Arrow1.stopped(planets)) {
            isAiming = true;
            startCoord = createVector(mouseX, mouseY);
        }
        if (Agree1_x < mouseX && mouseX < Agree1_x + Agree1_w && Agree1_y < mouseY && mouseY < Agree1_y + Agree1_h) {
            Agree1 = true;
        }
        if (Agree2_x < mouseX && mouseX < Agree2_x + Agree2_w && Agree2_y < mouseY && mouseY < Agree2_y + Agree2_h) {
            Agree2 = true;
        }
        if (Agree1 && Agree2) {
            game_ended = true;
        }
    } else {
        if (button_x < mouseX && mouseX < button_x + button_w && button_y < mouseY && mouseY < button_y + button_h) {
            waitframe = 0;
            initialize_game();
        }
    }
    if (BackMenu_x - BackMenu_w / 2 < mouseX && mouseX < BackMenu_x + BackMenu_w / 2 && BackMenu_y - BackMenu_h / 2 < mouseY && mouseY < BackMenu_y + BackMenu_h / 2) {
        Menu = true;
    }
}

function mouseReleased() {
    if (!game_ended) {
        if ((Arrow1 === null) || Arrow1.stopped(planets)) {
            if (isAiming) {
                let endCoord = createVector(mouseX, mouseY);
                let velocity = p5.Vector.sub(endCoord, startCoord).mult(-0.055);
                let player_position = players[current_turn].position.copy();
                Arrow1 = new Arrow(player_position, velocity, velocity.heading());
                current_turn = (current_turn + 1) % players.length;
            }
            isAiming = false;
            startCoord = null;
        }
    }
    if (game_ended && isAiming) {
        isAiming = false;
    }
}

function display_arrow_outside_view(arrow) {
    if (arrow !== null) {
        let center = createVector(width / 2, height / 2);
        let arrow_pos = arrow.coord;

        if (arrow_pos.x < 0 || arrow_pos.x > width || arrow_pos.y < 0 || arrow_pos.y > height) {
            let direction = p5.Vector.sub(arrow_pos, center).normalize();

            let t_min = Infinity;
            let edge_point = null;
            let multx = 1;
            let multy = 1;

            if (direction.x !== 0) {
                let t = -center.x / direction.x;
                let y = center.y + t * direction.y;
                if (0 <= y && y <= height && t > 0) {
                    if (t < t_min) {
                        t_min = t;
                        edge_point = createVector(0, y);
                        multy = 0;
                        multx = 1;
                    }
                }

                t = (width - center.x) / direction.x;
                y = center.y + t * direction.y;
                if (0 <= y && y <= height && t > 0) {
                    if (t < t_min) {
                        t_min = t;
                        edge_point = createVector(width, y);
                        multy = 0;
                        multx = -1;
                    }
                }
            }

            if (direction.y !== 0) {
                let t = -center.y / direction.y;
                let x = center.x + t * direction.x;
                if (0 <= x && x <= width && t > 0) {
                    if (t < t_min) {
                        t_min = t;
                        edge_point = createVector(x, 0);
                        multy = -1;
                        multx = 0;
                    }
                }

                t = (height - center.y) / direction.y;
                x = center.x + t * direction.x;
                if (0 <= x && x <= width && t > 0) {
                    if (t < t_min) {
                        t_min = t;
                        edge_point = createVector(x, height);
                        multy = 1;
                        multx = 0;
                    }
                }
            }

            if (edge_point !== null) {
                fill(255, 0, 0);
                circle(edge_point.x, edge_point.y, 10);

                let total_distance = arrow_pos.dist(center);
                let boundary_distance = edge_point.dist(center);
                let remaining_distance = total_distance - boundary_distance;
                fill(255);
                textSize(12);
                text(`${int(remaining_distance)} px`, edge_point.x + 35 * multx, edge_point.y - 20 * multy);
            }
        }
    }
}

class Arrow {
    constructor(coord, v, angle) {
        this.coord = coord;
        this.v = v;
        this.angle = angle;
        this.frames = 0;
    }

    gravity(planets) {
        let accel = createVector(0, 0);
        for (let planet of planets) {
            let direction = p5.Vector.sub(planet.coord, this.coord);
            let distanceSq = direction.magSq();
            let forceMagnitude = planet.mass / distanceSq;
            let force = direction.normalize().mult(forceMagnitude);
            accel.add(force.mult(gval));
        }
        if (!this.stopped(planets)) {
            this.v.add(accel.mult(dt));
            this.coord.add(p5.Vector.mult(this.v, dt));
        } else {
            this.v.x *= 0.9;
            this.v.y *= 0.9;
        }
        this.frames += 1;
    }

    stopped(planets) {
        for (let planet of planets) {
            if (this.coord.dist(planet.coord) <= planet.radius / 2 ||
                this.coord.x > width * 3 || this.coord.x < -width * 2 ||
                this.coord.y > height * 3 || this.coord.y < -height * 2) {
                return true;
            }
        }
        return false;
    }

    check_collision_with_players(players) {
        for (let player of players) {
            if ((player === players[current_turn] || this.frames > 40) && !this.stopped(planets)) {
                let angle_offset = atan2(sin(player.latitude), cos(player.latitude));
                let ellipse_width = player.radius * 1.25;
                let ellipse_height = player.radius * 0.4;

                let dx = this.coord.x - player.position.x;
                let dy = this.coord.y - player.position.y;
                let rotated_x = cos(angle_offset) * dx + sin(angle_offset) * dy;
                let rotated_y = -sin(angle_offset) * dx + cos(angle_offset) * dy;

                if ((rotated_x ** 2) / (ellipse_width ** 2) + (rotated_y ** 2) / (ellipse_height ** 2) <= 1) {
                    player.reduce_size();
                    if (!game_ended) {
                        score[players.indexOf(player)] += 1;
                    }
                    game_ended = true;
                    return true;
                }
            }
        }
        return false;
    }

    display() {
        fill(123, 13, 21);
        stroke(255);
        strokeWeight(1);
        push();
        translate(this.coord.x, this.coord.y);
        rotate(this.v.heading());
        rectMode(CENTER);
        rect(0, 0, 20, 5);
        pop();
    }

    getv() {
        return this.v;
    }

    getcoord() {
        return this.coord;
    }
}

class Planets {
    constructor(coord, radius, mass, col) {
        this.coord = coord;
        this.radius = radius;
        this.mass = mass;
        this.col = col;
    }

    display() {
        fill(this.col[0], this.col[1], this.col[2]);
        stroke(150);
        strokeWeight(2);
        circle(this.coord.x, this.coord.y, this.radius);
    }

    getMass() {
        return this.mass;
    }

    getcoord() {
        return this.coord;
    }
}

class Player {
    constructor(planet, latitude, radius) {
        this.planet = planet;
        this.latitude = latitude;
        this.radius = radius;
        this.update_position();
    }

    update_position() {
        this.position = createVector(
            this.planet.coord.x + cos(this.latitude) * (this.planet.radius / 2 + this.radius),
            this.planet.coord.y + sin(this.latitude) * (this.planet.radius / 2 + this.radius)
        );
    }

    reduce_size() {
        if (this.radius > 5) {
            this.radius *= 0.1;
        }
    }

    display(is_current_turn) {
        if (is_current_turn && current_turn === 1) {
            fill(0, 0, 150);
        } else if (is_current_turn && current_turn === 0) {
            fill(150, 0, 0);
        } else if (!is_current_turn && current_turn === 0) {
            fill(0, 0, 150);
        } else if (!is_current_turn && current_turn === 1) {
            fill(150, 0, 0);
        }
        stroke(255);
        push();
        translate(this.position.x, this.position.y);
        rotate(this.latitude + HALF_PI);
        circle(0, -this.radius * 0.75, this.radius * 0.5);
        line(0, -this.radius * 0.5, 0, this.radius * 0.5);
        line(-this.radius * 0.35, this.radius * 0.15, 0, -this.radius * 0.1);
        line(0, -this.radius * 0.1, this.radius * 0.35, this.radius * 0.15);
        line(0, this.radius * 0.5, -this.radius * 0.25, this.radius);
        line(0, this.radius * 0.5, this.radius * 0.25, this.radius);
        if (is_current_turn) {
            textAlign(CENTER);
            textSize(20);
            fill(255, 0, 0);
            text("V", 0, -this.radius * 1.5);
        }
        pop();
    }
}
