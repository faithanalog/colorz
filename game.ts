//Some functional programming stuff
//I might not actually use it all
class FP {

    /**
     * Creates a new array of the application of f on all
     * elements of the input array
     */
    map<T,U>(arr: Array<T>, f: (x: T) => U): Array<U> {
        var out = new Array(arr.length);
        for (var i = 0; i < arr.length; i++) {
            out[i] = f(arr[i]);
        }
        return out;
    }

    /**
     * Returns a new array of all elements for which f is true
     */
    filter<T>(arr: Array<T>, f: (x: T) => boolean): Array<T> {
        var out = [];
        arr.forEach(function(x) {
            if (f(x))
                out.push(x);
        });
        return out;
    }

    /**
     * Returns a new array of all elements for which f is false
     */
    filterNot<T>(arr: Array<T>, f: (x: T) => boolean): Array<T> {
        return this.filter(arr, (x) => !f(x));
    }

    /**
     * Returns first element for which f is true, or null if nothing matches
     */
    firstWhere<T>(arr: Array<T>, f: (x: T) => boolean): T {
        for (var i = 0; i < arr.length; i++) {
            var x = arr[i];
            if (f(x))
                return x;
        }
        return null;
    }

    /**
     * Returns whether or not the array contains the given element
     */
    contains<T>(arr: Array<T>, x: T): boolean {
        return arr.indexOf(x) >= 0;
    }

    /**
     * Zips two arrays. Result is an array of pairs, the length of which is
     * equivelant to the smallest of the two arrays passed in.
     */
    zip<T,U>(xs: Array<T>, ys: Array<U>): Array<Pair<T,U>> {
        var xlen = xs.length;
        var ylen = ys.length;
        var length = xlen < ylen ? xlen : ylen;
        var out = new Array(length);
        for (var i = 0; i < length; i++) {
            out[i] = new Pair(xs[i], ys[i]);
        }
        return out;
    }

    /**
     * Zips an array with it's indices as the right element. see zip()
     */
    zipWithIndex<T>(xs: Array<T>): Array<Pair<T,number>> {
        var out = new Array(xs.length);
        for (var i = 0; i < out.length; i++) {
            out[i] = new Pair(xs[i], i);
        }
        return out;
    }

    /**
     * Creates an array of a range of numbers from [min,max]
     */
    range(min: number, max: number, interval = 1): Array<number> {
        var length = ~~((max - min) / interval) + 1;
        var out = new Array(length);
        for (var i = 0; i < length; i++) {
            out[i] = min + interval * i;
        }
        return out;
    }
}

class Pair<T,U> {
    fst: T;
    snd: U;

    constructor(fst: T, snd: U) {
        this.fst = fst;
        this.snd = snd;
    }
}

//FP accessor
//Naming this '_' means if I want to switch to
//underscorejs in the future it's not difficult
var _: FP = new FP();

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

        var xlibColors = _.map(_.range(0, 255), function(x) {
            var rgb16 = (x << 8) | x;
            var r = ((rgb16 >> 11) & 0x1F) * 0xFF / 0x1F;
            var g = ((rgb16 >>  5) & 0x3F) * 0xFF / 0x3F;
            var b = ( rgb16        & 0x1F) * 0xFF / 0x1F;
            return (r << 16) | (g << 8) | b;
        });

        var toFillStyle = (x) => "#" + (0x1000000 | x).toString(16).substr(1);

        this.palette         = _.map(xlibColors, toFillStyle);
        this.paletteInverted = _.map(xlibColors, (x) => toFillStyle(~x & 0xFFFFFF));
    }

    setPixel(x: number, y: number, color: number) {
        this.pixels[x + y * 4] = color;
    }

    getPixel(x: number, y: number): number {
        return this.pixels[x + y * 4];
    }

    /**
     * Copies the internal pixel data to the
     * canvas on the web page, optionally using a specific palette
     */
    drawScreen(palette = this.palette): void {
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

    /**
     * Draws the screen with an inverted version of the
     * default palette
     */
    drawScreenInverted(): void {
        this.drawScreen(this.paletteInverted);
    }
}

/**
 * IDs of different tile types, as well as a few groups of tiles
 */
class Tiles {
    static EMPTY        = 0;
    static FLOOR        = 42;
    static FLOOR2       = 40;
    static FLOOR3       = 33;
    static FLOOR4       = 81;
    static RED          = 224;
    static BLUE         = 24;
    static GREEN        = 7;
    static DARK_RED     = 160;
    static DARK_GREEN   = 4;
    static DARK_BLUE    = 16;
    static CYAN         = 31;
    static MAGENTA      = 248;
    static YELLOW       = 231;
    static DARK_CYAN    = 21;
    static DARK_MAGENTA = 144;
    static DARK_YELLOW  = 197;
    static WALL         = 255;
    static WALL2        = 122;
    static WALL3        = 120;
    static WALL4        = 176;
    static WALL5        = 113;
    static WATER        = 18;
    static WATER2       = 20;
    static WATER3       = 60;
    static WATER4       = 126;
    static WATER_LOW    = 9;
    static BRIDGE_RAMP  = 173;
    static BRIDGE_RAMP2 = 140;
    static BRIDGE       = 181;
    static TELEPORT_SRC = 227;
    static TELEPORT_DST = 162;
    static GOLD         = 229;
    static BOULDER      = 107;
    static WIN          = 151;

    static WATERS = [Tiles.WATER,
                     Tiles.WATER2,
                     Tiles.WATER3,
                     Tiles.WATER4];

    /**
     * Tiles which are normally impassable to most entities
     */
    static IMPASSABLE = [Tiles.WALL,
                         Tiles.WALL2,
                         Tiles.WALL3,
                         Tiles.WALL4,
                         Tiles.WALL5,
                         Tiles.WATER,
                         Tiles.WATER2,
                         Tiles.WATER3];

    /**
     * Tiles which act as paints
     */
    static PAINTS = [Tiles.DARK_RED,
                     Tiles.DARK_GREEN,
                     Tiles.DARK_BLUE,
                     Tiles.DARK_CYAN,
                     Tiles.DARK_MAGENTA,
                     Tiles.DARK_YELLOW];

    /**
     * Tiles which may act as floors.
     * Entities can not pass from a floor to a bridge
     */
    static FLOORS = [Tiles.EMPTY,
                     Tiles.FLOOR,
                     Tiles.FLOOR2,
                     Tiles.FLOOR3,
                     Tiles.FLOOR4,
                     Tiles.WATER_LOW]
}

/**
 * Movement directions
 */
class Direction {
    static UP    = 0;
    static DOWN  = 1;
    static LEFT  = 2;
    static RIGHT = 3;
}

class World {

    static WIDTH  = 128;
    static HEIGHT = 63;
 
    initial_tiles: Uint8Array; //Initial state of tiles   
    tiles:    Uint8Array;
    player:   Player;
    entities: Array<Entity>;
    game:     Game;

    constructor(game: Game, tiles: Uint8Array) {
        this.game   = game;
        this.initial_tiles = tiles;
        this.tiles = new Uint8Array(tiles.length);
        this.initWorld();
    }

    /**
     * Initialize the world at the start of the game or after restarting
     */
    initWorld(): void {
        var dst = this.tiles;
        var src = this.initial_tiles;
        var len = dst.length;
        for (var i = 0; i < len; i++)
            dst[i] = src[i];
        this.player = new Player(this);
        this.player.setPosition(5, 1);
        var boulder = new Boulder(this);
        boulder.setPosition(122, 55);
        this.entities = [this.player, boulder];
    }

    getTile(x: number, y: number): number {
        return this.tiles[x + y * World.WIDTH];
    }

    setTile(x: number, y: number, tile: number): void {
        this.tiles[x + y * World.WIDTH] = tile;
    }

    /**
     * Teleports the player through a sequence of rooms at a given interval.
     * The player will be frozen throughought, and maintain position relative
     * to the room. The player will be left in the room given by the final
     * animation "frame". If unfreeze is false, the player will be left frozen.
     * if onDone != null, it will be called after the animation is done.
     */
    displayAnimation(interval: number, rooms: Array<Array<number>>, unfreeze = true, onDone: () => void = null): void {
        var world = this;
        setTimeout(() => world.player.frozen = true, 0);
        _.zipWithIndex(
            _.map(rooms, (r) => function() {
                var px = world.player.x - world.player.roomX;
                var py = world.player.y - world.player.roomY;
                world.player.setPosition(px + r[0], py + r[1]);
                world.game.redrawGame();
            })
        ).forEach((x) => setTimeout(x.fst, x.snd * interval));
        setTimeout(function() {
            world.player.frozen = !unfreeze;
            if (onDone !== null)
                onDone();
        }, interval * (rooms.length - 1));
    }

    animateWaterDrain(): void {
        this.displayAnimation(300, [
            [56, 0],
            [56, 3],
            [56, 6],
            [108, 24]
        ]);
    }

    endGame(): void {
        var player     = this.player;
        var world      = this;
        this.entities  = [];
        var frames     = _.map(_.range(0, 11), (x) => [x * 4, 48]);
        var goldFrames = _.map(_.range(0, player.goldCollected), (x) => [x * 4, 51]);

        function restart() {
            world.initWorld();
            world.game.redrawGame();
        }

        this.displayAnimation(150, frames, false, function() {
            world.displayAnimation(450, goldFrames, false, () => setTimeout(restart, 2000));
        });
    }

}

class Entity {
    x:     number;
    y:     number;
    color: number;
    world: World;
    constructor(color: number, world: World) {
        this.x = 0;
        this.y = 0;
        this.color = color;
        this.world = world;
    }

    /**
     * X coordinate of the top-left corner of the room containing the entity
     */
    get roomX(): number {
        return ~~(this.x / 4) * 4;
    }

    /**
     * Y coordiante of the top-left corner of the room containing the entity
     */
    get roomY(): number {
        return ~~(this.y / 3) * 3;
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

    get tileBeneath(): number {
        return this.world.getTile(this.x, this.y);
    }

    /**
     * Check whether the entity can move from one tile to another
     * @param prev The tile the entity is currently standing on
     * @param next The tile the entity is moving to
     */
    canPassThrough(prev: number, next: number): boolean {
        switch (next) {
            case Tiles.RED:
                return this.isRed;
            case Tiles.GREEN:
                return this.isGreen;
            case Tiles.BLUE:
                return this.isBlue;
            case Tiles.CYAN:
                return this.isCyan;
            case Tiles.MAGENTA:
                return this.isMagenta;
            case Tiles.YELLOW:
                return this.isYellow;
            case Tiles.BRIDGE:
                //if (!(prev === Tiles.BRIDGE_RAMP  ||
                      //prev === Tiles.BRIDGE_RAMP2 ||
                      //prev === Tiles.BRIDGE))
                if (_.contains(Tiles.FLOORS, prev))
                    return false;
                break;
        }
        return !_.contains(Tiles.IMPASSABLE, next);
    }

    /**
     * Sets an entities position without performing any on-move effects
     */
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    /**
     * Activates the tile beneath the entity
     */
    activateTile(): void {
        switch (this.tileBeneath) {
            case Tiles.TELEPORT_SRC:
                var link = _.firstWhere(TELEPORT_LINKS, (tp) => this.x === tp.srcX && this.y === tp.srcY);
                if (link !== null)
                    this.teleport(link.dstX, link.dstY);
                break;
        }
    }

    /**
     * Teleports the entity to a position, activating the tile beneath it
     */
    teleport(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.activateTile();
    }

    /**
     * Attempts to move the entity in a certain direction
     * @return Whether or not the entity moved
     */
    move(direction: number): boolean {
        var ox = this.x;
        var oy = this.y;
        var nx = ox;
        var ny = oy;
        switch (direction) {
            case Direction.UP:
                ny--;
                break;
            case Direction.DOWN:
                ny++;
                break;
            case Direction.LEFT:
                nx--;
                break;
            case Direction.RIGHT:
                nx++;
                break;
        }
        var prevTile = this.tileBeneath;
        var nextTile = this.world.getTile(nx, ny);
        if (!this.canPassThrough(prevTile, nextTile))
            return false;
        var collidingEntity = _.firstWhere(this.world.entities,
                                           (e) => e !== this && e.x === nx && e.y === ny);
        if (collidingEntity !== null && !collidingEntity.move(direction))
            return false;
        this.x = nx;
        this.y = ny;
        this.activateTile();
        return true;
    }
}

class Player extends Entity {
    goldCollected: number;
    frozen: boolean;

    constructor(world: World) {
        super(Tiles.DARK_RED, world);
        this.goldCollected = 0;
        this.frozen = false;
    }

    paint(color: number) {
        if (this.color !== color) {
            this.color = color;
            this.world.game.flashScreen();
        }
    }

    canPassThrough(prev: number, next: number): boolean {
        return !this.frozen && super.canPassThrough(prev, next);
    }

    activateTile(): void {
        var tile = this.tileBeneath;

        if (_.contains(Tiles.PAINTS, tile))
            this.paint(tile);
        else switch (tile) {
            case Tiles.GOLD:
                //Get the floor color based on surrounding floor tiles
                var world = this.world;
                var surroundings = _.map([[-1,0],[1,0],[0,-1],[0,1]],
                                         (x) => world.getTile(this.x + x[0], this.y + x[1]))
                var floor = _.firstWhere(surroundings, (x) => _.contains(Tiles.FLOORS, x));
                world.setTile(this.x, this.y, floor || 0);
                world.game.flashScreen();
                this.goldCollected++;
                break;
            case Tiles.WIN:
                this.world.endGame();
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

    activateTile(): void {
        this.tileBeneath === Tiles.WATER2 ? this.world.animateWaterDrain() 
                                          : super.activateTile();
    }

    canPassThrough(prev: number, next: number): boolean {
        if (next === Tiles.BRIDGE_RAMP)
            return false;
        if (next === Tiles.WATER2)
            return true;
        return super.canPassThrough(prev, next);
    }
}

class TeleportLink {
    srcX: number;
    srcY: number;
    dstX: number;
    dstY: number;

    constructor(srcX: number, srcY: number, dstX: number, dstY: number) {
        this.srcX = srcX;
        this.srcY = srcY;
        this.dstX = dstX;
        this.dstY = dstY;
    }
}

//Teleport link coordinates
//Format: sourceX, sourceY, destX, destY
var TELEPORT_LINKS: Array<TeleportLink> = [
    new TeleportLink(19,  6, 17,  8),
    new TeleportLink(24,  7, 48,  7),
    new TeleportLink(36, 22, 48,  7),
    new TeleportLink(43,  6, 17,  8),

    //Teleport Loop
    new TeleportLink(22, 33, 26, 44),
    new TeleportLink(26, 33, 30, 44),
    new TeleportLink(30, 33, 38, 44),
    new TeleportLink(38, 33, 26, 44),
    new TeleportLink(34, 33, 85, 49), //Loop Exit to sewers

    //Spaceship
    new TeleportLink(97, 13, 53, 16), //Sewers to spaceship
    new TeleportLink(49, 19, 58, 22), //Challenge 1 - l - pass
    new TeleportLink(66, 19, 53, 16), //Challenge 1 - r - fail
    new TeleportLink(49, 25, 53, 16), //Challenge 2 - l - fail
    new TeleportLink(66, 25, 58, 28), //Challenge 2 - r - pass
    new TeleportLink(49, 31, 58, 34), //Challenge 3 - l - pass
    new TeleportLink(66, 31, 53, 16), //Challenge 3 - r - fail
    new TeleportLink(49, 37, 58, 40), //Challenge 4 - l - pass
    new TeleportLink(66, 37, 53, 16)  //Challenge 4 - r - fail
];

/**
 * Key code constants
 */
class Keys {
    static LEFT  = 37;
    static UP    = 38;
    static RIGHT = 39;
    static DOWN  = 40;
}

class Game {

    lcd:   LCD;
    world: World;
    keys:  Array<boolean>; //Maintains key states. True = key down, False = key up

    constructor(lcd: LCD, tiles: Uint8Array) {
        this.lcd   = lcd;
        this.keys  = new Array(256);
        this.world = new World(this, tiles);

        lcd.canvas.onkeydown = function(evt) {
            var k = evt.keyCode;
            //if (this.keys[k])
                //return;
            this.keys[k] = true;
            //Don't block input loop
            setTimeout(function() {
                var player: Player = this.world.player;
                switch(k) {
                    case Keys.LEFT:
                        player.move(Direction.LEFT);
                        break;
                    case Keys.RIGHT:
                        player.move(Direction.RIGHT);
                        break;
                    case Keys.UP:
                        player.move(Direction.UP);
                        break;
                    case Keys.DOWN:
                        player.move(Direction.DOWN);
                        break;
                }
                this.redrawGame();
            }.bind(this), 0);
        }.bind(this);
        
        lcd.canvas.onkeyup = function(evt) {
            this.keys[evt.keyCode] = false;
        }.bind(this);
    }

    flashScreen(): void {
        var game = this;
        setTimeout(function() {
            game.lcd.drawScreenInverted();
            setTimeout(() => game.redrawGame(), 150);
        }, 0);
    }

    redrawGame(): void {
        var player   = this.world.player;
        var entities = this.world.entities;

        var minX = player.roomX;
        var minY = player.roomY;

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 4; x++) {
                this.lcd.setPixel(x, y, this.world.getTile(x + minX, y + minY));
            }
        }
        _.filter(entities, (e) => e.roomX === minX && e.roomY === minY)
         .forEach((e) => this.lcd.setPixel(e.x - minX, e.y - minY, e.color));
        this.lcd.drawScreen();
    }

    launch(): void {
        this.redrawGame();
    }

}

function main(): void {
    var canvas = <HTMLCanvasElement>document.getElementById("game_canvas");
    canvas.focus();
    var lcd  = new LCD(canvas);
    
    var req = new XMLHttpRequest();
    req.onload = function() {
        var tiles_in = <Array<number>>JSON.parse(req.response);
        var tiles    = new Uint8Array(tiles_in);
        var game     = new Game(lcd, tiles);
        game.launch();
    };
    req.open("GET", "world.json", true);
    req.send();
}
