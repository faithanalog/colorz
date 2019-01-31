class LCD {
    
    width:   number;
    height:  number;
    ctx:     CanvasRenderingContext2D;
    canvas:  HTMLCanvasElement;
    pixels:  Uint8Array;
    palette: Array<String>;
    paletteInverted: Array<String>

    constructor(canvas: HTMLCanvasElement) {
        this.canvas  = canvas;
        this.width   = canvas.width;
        this.height  = canvas.height;
        this.ctx     = <CanvasRenderingContext2D>canvas.getContext("2d");
        this.pixels  = new Uint8Array(4 * 3);
        this.palette = new Array(256);
        this.paletteInverted = new Array(256);

        //Generate xLIBC palette
        for (var i = 0; i < this.palette.length; i++) {
            var rgb16 = (i << 8) | i;
            var r = ((rgb16 >> 11) & 0x1F) * 0xFF / 0x1F;
            var g = ((rgb16 >> 5)  & 0x3F) * 0xFF / 0x3F;
            var b = ( rgb16        & 0x1F) * 0xFF / 0x1F;
            var rgb24 = (r << 16) | (g << 8) | b;
            this.palette[i]         = "#" + (0x1000000 |  rgb24).toString(16).substr(1);
            this.paletteInverted[i] = "#" + (0x1000000 | (~rgb24 & 0xFFFFFF)).toString(16).substr(1);
        }
    }

    setPixel(x: number, y: number, color: number) {
        this.pixels[x + y * 4] = color;
    }

    getPixel(x: number, y: number): number {
        return this.pixels[x + y * 4];
    }

    drawScreen(palette = this.palette) {
        var dx = this.width  / 4;
        var dy = this.height / 3;
        for (var i = 0; i < this.pixels.length; i++) {
            var px =   (i % 4);
            var py = ~~(i / 4);
            var x  = px * dx;
            var y  = py * dy;
            this.ctx.fillStyle = palette[this.pixels[i]];
            this.ctx.fillRect(x, y, dx, dy);
        }
    }

    drawScreenInverted() {
        this.drawScreen(this.paletteInverted);
    }
}

class Room {
    x: number;
    y: number;
    pixels: Array<number>;
    constructor(x: number, y: number, pixels: Array<number>) {
        this.x = x;
        this.y = y;
        this.pixels = pixels;
    }

    getPixel(x: number, y: number): number {
        return this.pixels[x + y * 4];
    }

    setPixel(x: number, y: number, color: number) {
        this.pixels[x + y * 4] = color;
    }
}

class Tiles {
    static RED          = 224;
    static BLUE         = 24;
    static GREEN        = 7;
    static DARK_RED     = 160;
    static DARK_BLUE    = 16;
    static DARK_GREEN   = 4;
    static CYAN         = 31;
    static MAGENTA      = 248;
    static YELLOW       = 231;
    static DARK_CYAN    = 21;
    static DARK_MAGENTA = 144;
    static DARK_YELLOW  = 197;
    static WALL         = 255;
    static WALL2        = 122;
    static WALL3        = 120;
    static WATER        = 18;
    static WATER2       = 20;
    static WATER3       = 60;
    static BRIDGE_RAMP  = 173;
    static BRIDGE_RAMP2 = 140;
    static BRIDGE       = 181;
    static TELEPORT_SRC = 227;
    static TELEPORT_DST = 162;
    static GOLD         = 229;
    static BOULDER      = 107;

    static ALL_WATER  = [Tiles.WATER, Tiles.WATER2, Tiles.WATER3];

    static IMPASSABLE = [Tiles.WALL, Tiles.WALL2, Tiles.WALL3,
                         Tiles.WATER, Tiles.WATER2, Tiles.WATER3]
}

class World {
    
    rooms: Array<Room>;
    player: Player;
    entities: Array<Entity>;
    game: Game;

    constructor(game: Game, rooms: Array<Room>) {
        this.game = game;
        this.rooms = rooms;
        this.player = new Player(this);
        this.player.room = this.rooms[1];
        this.player.x = 1;
        this.player.y = 1;
        var boulder = new Boulder(this);
        boulder.x = 2;
        boulder.y = 1;
        boulder.room = this.getRoom(~~(38 / 4), ~~(55 /3 ));
        this.entities = [this.player, boulder];
    }

    getRoom(rx: number, ry: number): Room {
        return this.rooms[rx + ry * (128 / 4)];
    }

    moveEntityAbsolute(entity: Entity, x: number, y: number) {
        entity.x = x % 4;
        entity.y = y % 3;
        entity.room = this.getRoom(~~(x / 4), ~~(y / 3));
        entity.activateTile();
    }
}

class Entity {
    room:  Room;
    x:     number;
    y:     number;
    color: number;
    world: World;
    constructor(color: number, world: World) {
        this.room = null;
        this.x = 0;
        this.y = 0;
        this.color = color;
        this.world = world;
    }

    get worldX(): number {
        return this.x + (this.room.x * 4);
    }

    get worldY(): number {
        return this.y + (this.room.y * 3);
    }

    get isRed(): boolean {
        return this.color === Tiles.DARK_RED     ||
               this.color === Tiles.DARK_MAGENTA ||
               this.color === Tiles.DARK_YELLOW;
    }

    get isGreen(): boolean {
        return this.color === Tiles.DARK_GREEN ||
               this.color === Tiles.DARK_CYAN  ||
               this.color === Tiles.DARK_YELLOW;
    }

    get isBlue(): boolean {
        return this.color === Tiles.DARK_BLUE ||
               this.color === Tiles.DARK_CYAN ||
               this.color === Tiles.DARK_MAGENTA;
    }

    get isCyan(): boolean {
        return this.color === Tiles.DARK_CYAN;
    }

    get isMagenta(): boolean {
        return this.color === Tiles.DARK_MAGENTA;
    }

    get isYellow(): boolean {
        return this.color === Tiles.DARK_YELLOW;
    }

    canPassThrough(prev: number, next: number): boolean {
        if (next === Tiles.RED)
            return this.isRed;
        if (next === Tiles.GREEN)
            return this.isGreen;
        if (next === Tiles.BLUE)
            return this.isBlue;
        if (next === Tiles.CYAN)
            return this.isCyan;
        if (next === Tiles.MAGENTA)
            return this.isMagenta;
        if (next === Tiles.YELLOW)
            return this.isYellow;
        if (next === Tiles.BRIDGE && !(prev === Tiles.BRIDGE_RAMP  ||
                                        prev === Tiles.BRIDGE_RAMP2 ||
                                        prev === Tiles.BRIDGE))
            return false;
        return Tiles.IMPASSABLE.indexOf(next) === -1;
    }

    /**
     * Activates the tile beneath the entity
     */
    activateTile(): void {
        var room = this.room;
        var tile = room.getPixel(this.x, this.y);
        switch (tile) {
            case Tiles.TELEPORT_SRC:
                for (var i = 0; i < TELEPORT_LINKS.length; i++) {
                    var p = TELEPORT_LINKS[i];
                    if (this.worldX === p[0] && this.worldY === p[1]) {
                        this.world.moveEntityAbsolute(this, p[2], p[3]);
                        break;
                    }
                }
                break;
        }
    }

    /**
     * Attempts to move the entity in a certain direction
     * @return Whether or not the entity moved
     */
    move(vx: number, vy: number): boolean {
        var ox = this.x;
        var oy = this.y;
        var nx = this.x + vx;
        var ny = this.y + vy;
        var room = this.room;
        if (nx < 0) {
            this.room = this.world.getRoom(room.x - 1, room.y);
            this.x    = 3;
        } else if (ny < 0) {
            this.room = this.world.getRoom(room.x, room.y - 1);
            this.y    = 2;
        } else if (nx >= 4) {
            this.room = this.world.getRoom(room.x + 1, room.y);
            this.x    = 0;
        } else if (ny >= 3) {
            this.room = this.world.getRoom(room.x, room.y + 1);
            this.y    = 0;
        } else {
            var prevTile = room.getPixel(ox, oy);
            var tile     = room.getPixel(nx, ny);
            if (this.canPassThrough(prevTile, tile)) {
                this.x = nx;
                this.y = ny;
            }

        }
        if (room !== this.room || ox !== this.x || oy !== this.y) {
            for (var i = 0; i < this.world.entities.length; i++) {
                var e = this.world.entities[i];
                if (e !== this && (e.x === this.x && e.y === this.y && e.room === this.room)) {
                    if (!e.move(vx, vy)) {
                        this.room = room;
                        this.x = ox;
                        this.y = oy;
                        return false;
                    }
                }
            }
            this.activateTile();
            return true;
        }
    }
}

class Player extends Entity {
    goldCollected: number;

    constructor(world: World) {
        super(Tiles.DARK_RED, world);
        this.goldCollected = 0;
    }

    paint(color: number) {
        if (this.color !== color) {
            this.color = color;
            this.world.game.flashScreen();
        }
    }

    activateTile() {
        var room = this.room;
        var tile = room.getPixel(this.x, this.y);

        switch (tile) {
            case Tiles.DARK_RED:
            case Tiles.DARK_BLUE:
            case Tiles.DARK_GREEN:
            case Tiles.DARK_CYAN:
            case Tiles.DARK_MAGENTA:
            case Tiles.DARK_YELLOW:
                this.paint(tile);
                break;
            case Tiles.GOLD:
                room.setPixel(this.x, this.y, 0);
                this.world.game.flashScreen();
                this.goldCollected++;
                console.log("Score: " + this.goldCollected);
                break;
            default:
                super.activateTile();
                break;
        }
    }
}

class Boulder extends Entity {
    constructor(world: World) {
        super(Tiles.BOULDER, world);
    }

    canPassThrough(prev: number, next: number): boolean {
        if (next === Tiles.BRIDGE_RAMP)
            return false;
        if (next === Tiles.WATER)
            return true;
        return super.canPassThrough(prev, next);
    }
}

//Teleport link coordinates
//Format: sourceX, sourceY, destX, destY
var TELEPORT_LINKS: Array<Array<number>> = [
    [19,  6, 17,  8],
    [24,  7, 48,  7],
    [36, 22, 48,  7],
    [43,  6, 17,  8],

    //Loop
    [22, 33, 26, 44],
    [26, 33, 30, 44],
    [30, 33, 38, 44],
    [38, 33, 26, 44],
    [34, 33,  1, 49] //Loop Exit

];

class Game {

    lcd: LCD;
    world: World;
    keys: Array<boolean>;

    constructor(lcd: LCD, rooms: Array<Room>) {
        this.lcd   = lcd;
        this.keys  = new Array(256);
        this.world = new World(this, rooms);

        lcd.canvas.onkeydown = function(evt) {
            var k = evt.keyCode;
            //if (this.keys[k])
                //return;
            this.keys[k] = true;
            //Don't block input loop
            setTimeout(function() {
                switch(k) {
                    case 37: //Left Arrow
                        this.world.player.move(-1, 0);
                        break;
                    case 39: //Right Arrow
                        this.world.player.move(1, 0);
                        break;
                    case 38: //Up Arrow
                        this.world.player.move(0, -1);
                        break;
                    case 40: //Down Arrow
                        this.world.player.move(0, 1);
                        break;
                }
                this.redrawGame();
            }.bind(this), 0);
        }.bind(this);
        
        lcd.canvas.onkeyup = function(evt) {
            this.keys[evt.keyCode] = false;
        }.bind(this);

        lcd.canvas.onmousedown = function(evt) {
            var x    = evt.offsetX;
            var y    = evt.offsetY;
            var rx   = ~~(x / (lcd.width  / 4));
            var ry   = ~~(y / (lcd.height / 3));
            var room = this.world.player.room;
            var tile = room.getPixel(rx, ry)
            var wx   = rx + room.x * 4;
            var wy   = ry + room.y * 3;
            console.log("Tile: " + tile + " | " + wx + ", " + wy);
        }.bind(this);

        //this.moveEntityAbsolute(this.player, 2, 52);
    }

    flashScreen() {
        setTimeout(function() {
            this.lcd.drawScreenInverted();
            setTimeout(function() {
                this.redrawGame();
            }.bind(this), 150);
        }.bind(this), 0);
    }

    redrawGame() {
        var player   = this.world.player;
        var entities = this.world.entities;
        for (var i = 0; i < 12; i++) {
            this.lcd.pixels[i] = player.room.pixels[i];
        }
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            if (e.room === player.room)
                this.lcd.setPixel(e.x, e.y, e.color);
        }
        this.lcd.drawScreen();
    }

    launch() {
        this.redrawGame();
    }

}

function main() {
    var canvas = <HTMLCanvasElement>document.getElementById("game_canvas");
    var lcd  = new LCD(canvas);
    
    var req = new XMLHttpRequest();
    req.onload = function() {
        var rooms_in = <Array<any>>JSON.parse(req.response);
        var rooms    = new Array(rooms_in.length);
        for (var i = 0; i < rooms.length; i++) {
            var r = rooms_in[i];
            rooms[i] = new Room(r.x, r.y, r.pixels);
        }
        var game = new Game(lcd, rooms);
        game.launch();
    };
    req.open("GET", "world.json", true);
    req.send();
}
