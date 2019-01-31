var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
//Some functional programming stuff
//I might not actually use it all
var FP = (function () {
    function FP() {
    }
    /**
     * Creates a new array of the application of f on all
     * elements of the input array
     */
    FP.prototype.map = function (arr, f) {
        var out = new Array(arr.length);
        for (var i = 0; i < arr.length; i++) {
            out[i] = f(arr[i]);
        }
        return out;
    };
    /**
     * Returns a new array of all elements for which f is true
     */
    FP.prototype.filter = function (arr, f) {
        var out = [];
        arr.forEach(function (x) {
            if (f(x))
                out.push(x);
        });
        return out;
    };
    /**
     * Returns a new array of all elements for which f is false
     */
    FP.prototype.filterNot = function (arr, f) {
        return this.filter(arr, function (x) { return !f(x); });
    };
    /**
     * Returns first element for which f is true, or null if nothing matches
     */
    FP.prototype.firstWhere = function (arr, f) {
        for (var i = 0; i < arr.length; i++) {
            var x = arr[i];
            if (f(x))
                return x;
        }
        return null;
    };
    /**
     * Returns whether or not the array contains the given element
     */
    FP.prototype.contains = function (arr, x) {
        return arr.indexOf(x) >= 0;
    };
    /**
     * Zips two arrays. Result is an array of pairs, the length of which is
     * equivelant to the smallest of the two arrays passed in.
     */
    FP.prototype.zip = function (xs, ys) {
        var xlen = xs.length;
        var ylen = ys.length;
        var length = xlen < ylen ? xlen : ylen;
        var out = new Array(length);
        for (var i = 0; i < length; i++) {
            out[i] = new Pair(xs[i], ys[i]);
        }
        return out;
    };
    /**
     * Zips an array with it's indices as the right element. see zip()
     */
    FP.prototype.zipWithIndex = function (xs) {
        var out = new Array(xs.length);
        for (var i = 0; i < out.length; i++) {
            out[i] = new Pair(xs[i], i);
        }
        return out;
    };
    /**
     * Creates an array of a range of numbers from [min,max]
     */
    FP.prototype.range = function (min, max, interval) {
        if (interval === void 0) { interval = 1; }
        var length = ~~((max - min) / interval) + 1;
        var out = new Array(length);
        for (var i = 0; i < length; i++) {
            out[i] = min + interval * i;
        }
        return out;
    };
    return FP;
})();
var Pair = (function () {
    function Pair(fst, snd) {
        this.fst = fst;
        this.snd = snd;
    }
    return Pair;
})();
//FP accessor
//Naming this '_' means if I want to switch to
//underscorejs in the future it's not difficult
var _ = new FP();
var LCD = (function () {
    function LCD(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext("2d");
        this.pixels = new Uint8Array(4 * 3);
        var xlibColors = _.map(_.range(0, 255), function (x) {
            var rgb16 = (x << 8) | x;
            var r = ((rgb16 >> 11) & 0x1F) * 0xFF / 0x1F;
            var g = ((rgb16 >> 5) & 0x3F) * 0xFF / 0x3F;
            var b = (rgb16 & 0x1F) * 0xFF / 0x1F;
            return (r << 16) | (g << 8) | b;
        });
        var toFillStyle = function (x) { return "#" + (0x1000000 | x).toString(16).substr(1); };
        this.palette = _.map(xlibColors, toFillStyle);
        this.paletteInverted = _.map(xlibColors, function (x) { return toFillStyle(~x & 0xFFFFFF); });
    }
    LCD.prototype.setPixel = function (x, y, color) {
        this.pixels[x + y * 4] = color;
    };
    LCD.prototype.getPixel = function (x, y) {
        return this.pixels[x + y * 4];
    };
    /**
     * Copies the internal pixel data to the
     * canvas on the web page, optionally using a specific palette
     */
    LCD.prototype.drawScreen = function (palette) {
        if (palette === void 0) { palette = this.palette; }
        var dx = this.width / 4;
        var dy = this.height / 3;
        for (var i = 0; i < this.pixels.length; i++) {
            var px = (i % 4);
            var py = ~~(i / 4);
            var x = px * dx;
            var y = py * dy;
            this.ctx.fillStyle = palette[this.pixels[i]];
            this.ctx.fillRect(x, y, dx, dy);
        }
    };
    /**
     * Draws the screen with an inverted version of the
     * default palette
     */
    LCD.prototype.drawScreenInverted = function () {
        this.drawScreen(this.paletteInverted);
    };
    return LCD;
})();
/**
 * IDs of different tile types, as well as a few groups of tiles
 */
var Tiles = (function () {
    function Tiles() {
    }
    Tiles.EMPTY = 0;
    Tiles.FLOOR = 42;
    Tiles.FLOOR2 = 40;
    Tiles.FLOOR3 = 33;
    Tiles.FLOOR4 = 81;
    Tiles.RED = 224;
    Tiles.BLUE = 24;
    Tiles.GREEN = 7;
    Tiles.DARK_RED = 160;
    Tiles.DARK_GREEN = 4;
    Tiles.DARK_BLUE = 16;
    Tiles.CYAN = 31;
    Tiles.MAGENTA = 248;
    Tiles.YELLOW = 231;
    Tiles.DARK_CYAN = 21;
    Tiles.DARK_MAGENTA = 144;
    Tiles.DARK_YELLOW = 197;
    Tiles.WALL = 255;
    Tiles.WALL2 = 122;
    Tiles.WALL3 = 120;
    Tiles.WALL4 = 176;
    Tiles.WALL5 = 113;
    Tiles.WATER = 18;
    Tiles.WATER2 = 20;
    Tiles.WATER3 = 60;
    Tiles.WATER4 = 126;
    Tiles.WATER_LOW = 9;
    Tiles.BRIDGE_RAMP = 173;
    Tiles.BRIDGE_RAMP2 = 140;
    Tiles.BRIDGE = 181;
    Tiles.TELEPORT_SRC = 227;
    Tiles.TELEPORT_DST = 162;
    Tiles.GOLD = 229;
    Tiles.BOULDER = 107;
    Tiles.WIN = 151;
    Tiles.WATERS = [Tiles.WATER,
        Tiles.WATER2,
        Tiles.WATER3,
        Tiles.WATER4];
    /**
     * Tiles which are normally impassable to most entities
     */
    Tiles.IMPASSABLE = [Tiles.WALL,
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
    Tiles.PAINTS = [Tiles.DARK_RED,
        Tiles.DARK_GREEN,
        Tiles.DARK_BLUE,
        Tiles.DARK_CYAN,
        Tiles.DARK_MAGENTA,
        Tiles.DARK_YELLOW];
    /**
     * Tiles which may act as floors.
     * Entities can not pass from a floor to a bridge
     */
    Tiles.FLOORS = [Tiles.EMPTY,
        Tiles.FLOOR,
        Tiles.FLOOR2,
        Tiles.FLOOR3,
        Tiles.FLOOR4,
        Tiles.WATER_LOW];
    return Tiles;
})();
/**
 * Movement directions
 */
var Direction = (function () {
    function Direction() {
    }
    Direction.UP = 0;
    Direction.DOWN = 1;
    Direction.LEFT = 2;
    Direction.RIGHT = 3;
    return Direction;
})();
var World = (function () {
    function World(game, tiles) {
        this.game = game;
        this.initial_tiles = tiles;
        this.tiles = new Uint8Array(tiles.length);
        this.initWorld();
    }
    /**
     * Initialize the world at the start of the game or after restarting
     */
    World.prototype.initWorld = function () {
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
    };
    World.prototype.getTile = function (x, y) {
        return this.tiles[x + y * World.WIDTH];
    };
    World.prototype.setTile = function (x, y, tile) {
        this.tiles[x + y * World.WIDTH] = tile;
    };
    /**
     * Teleports the player through a sequence of rooms at a given interval.
     * The player will be frozen throughought, and maintain position relative
     * to the room. The player will be left in the room given by the final
     * animation "frame". If unfreeze is false, the player will be left frozen.
     * if onDone != null, it will be called after the animation is done.
     */
    World.prototype.displayAnimation = function (interval, rooms, unfreeze, onDone) {
        if (unfreeze === void 0) { unfreeze = true; }
        if (onDone === void 0) { onDone = null; }
        var world = this;
        setTimeout(function () { return world.player.frozen = true; }, 0);
        _.zipWithIndex(_.map(rooms, function (r) { return function () {
            var px = world.player.x - world.player.roomX;
            var py = world.player.y - world.player.roomY;
            world.player.setPosition(px + r[0], py + r[1]);
            world.game.redrawGame();
        }; })).forEach(function (x) { return setTimeout(x.fst, x.snd * interval); });
        setTimeout(function () {
            world.player.frozen = !unfreeze;
            if (onDone !== null)
                onDone();
        }, interval * (rooms.length - 1));
    };
    World.prototype.animateWaterDrain = function () {
        this.displayAnimation(300, [
            [56, 0],
            [56, 3],
            [56, 6],
            [108, 24]
        ]);
    };
    World.prototype.endGame = function () {
        var player = this.player;
        var world = this;
        this.entities = [];
        var frames = _.map(_.range(0, 11), function (x) { return [x * 4, 48]; });
        var goldFrames = _.map(_.range(0, player.goldCollected), function (x) { return [x * 4, 51]; });
        function restart() {
            world.initWorld();
            world.game.redrawGame();
        }
        this.displayAnimation(150, frames, false, function () {
            world.displayAnimation(450, goldFrames, false, function () { return setTimeout(restart, 2000); });
        });
    };
    World.WIDTH = 128;
    World.HEIGHT = 63;
    return World;
})();
var Entity = (function () {
    function Entity(color, world) {
        this.x = 0;
        this.y = 0;
        this.color = color;
        this.world = world;
    }
    Object.defineProperty(Entity.prototype, "roomX", {
        /**
         * X coordinate of the top-left corner of the room containing the entity
         */
        get: function () {
            return ~~(this.x / 4) * 4;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "roomY", {
        /**
         * Y coordiante of the top-left corner of the room containing the entity
         */
        get: function () {
            return ~~(this.y / 3) * 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isRed", {
        get: function () {
            return this.color === Tiles.DARK_RED ||
                this.color === Tiles.DARK_MAGENTA ||
                this.color === Tiles.DARK_YELLOW;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isGreen", {
        get: function () {
            return this.color === Tiles.DARK_GREEN ||
                this.color === Tiles.DARK_CYAN ||
                this.color === Tiles.DARK_YELLOW;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isBlue", {
        get: function () {
            return this.color === Tiles.DARK_BLUE ||
                this.color === Tiles.DARK_CYAN ||
                this.color === Tiles.DARK_MAGENTA;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isCyan", {
        get: function () {
            return this.color === Tiles.DARK_CYAN;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isMagenta", {
        get: function () {
            return this.color === Tiles.DARK_MAGENTA;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "isYellow", {
        get: function () {
            return this.color === Tiles.DARK_YELLOW;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "tileBeneath", {
        get: function () {
            return this.world.getTile(this.x, this.y);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Check whether the entity can move from one tile to another
     * @param prev The tile the entity is currently standing on
     * @param next The tile the entity is moving to
     */
    Entity.prototype.canPassThrough = function (prev, next) {
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
    };
    /**
     * Sets an entities position without performing any on-move effects
     */
    Entity.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
    };
    /**
     * Activates the tile beneath the entity
     */
    Entity.prototype.activateTile = function () {
        var _this = this;
        switch (this.tileBeneath) {
            case Tiles.TELEPORT_SRC:
                var link = _.firstWhere(TELEPORT_LINKS, function (tp) { return _this.x === tp.srcX && _this.y === tp.srcY; });
                if (link !== null)
                    this.teleport(link.dstX, link.dstY);
                break;
        }
    };
    /**
     * Teleports the entity to a position, activating the tile beneath it
     */
    Entity.prototype.teleport = function (x, y) {
        this.x = x;
        this.y = y;
        this.activateTile();
    };
    /**
     * Attempts to move the entity in a certain direction
     * @return Whether or not the entity moved
     */
    Entity.prototype.move = function (direction) {
        var _this = this;
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
        var collidingEntity = _.firstWhere(this.world.entities, function (e) { return e !== _this && e.x === nx && e.y === ny; });
        if (collidingEntity !== null && !collidingEntity.move(direction))
            return false;
        this.x = nx;
        this.y = ny;
        this.activateTile();
        return true;
    };
    return Entity;
})();
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(world) {
        _super.call(this, Tiles.DARK_RED, world);
        this.goldCollected = 0;
        this.frozen = false;
    }
    Player.prototype.paint = function (color) {
        if (this.color !== color) {
            this.color = color;
            this.world.game.flashScreen();
        }
    };
    Player.prototype.canPassThrough = function (prev, next) {
        return !this.frozen && _super.prototype.canPassThrough.call(this, prev, next);
    };
    Player.prototype.activateTile = function () {
        var _this = this;
        var tile = this.tileBeneath;
        if (_.contains(Tiles.PAINTS, tile))
            this.paint(tile);
        else
            switch (tile) {
                case Tiles.GOLD:
                    //Get the floor color based on surrounding floor tiles
                    var world = this.world;
                    var surroundings = _.map([[-1, 0], [1, 0], [0, -1], [0, 1]], function (x) { return world.getTile(_this.x + x[0], _this.y + x[1]); });
                    var floor = _.firstWhere(surroundings, function (x) { return _.contains(Tiles.FLOORS, x); });
                    world.setTile(this.x, this.y, floor || 0);
                    world.game.flashScreen();
                    this.goldCollected++;
                    break;
                case Tiles.WIN:
                    this.world.endGame();
                    break;
                default:
                    _super.prototype.activateTile.call(this);
                    break;
            }
    };
    return Player;
})(Entity);
var Boulder = (function (_super) {
    __extends(Boulder, _super);
    function Boulder(world) {
        _super.call(this, Tiles.BOULDER, world);
    }
    Boulder.prototype.activateTile = function () {
        this.tileBeneath === Tiles.WATER2 ? this.world.animateWaterDrain()
            : _super.prototype.activateTile.call(this);
    };
    Boulder.prototype.canPassThrough = function (prev, next) {
        if (next === Tiles.BRIDGE_RAMP)
            return false;
        if (next === Tiles.WATER2)
            return true;
        return _super.prototype.canPassThrough.call(this, prev, next);
    };
    return Boulder;
})(Entity);
var TeleportLink = (function () {
    function TeleportLink(srcX, srcY, dstX, dstY) {
        this.srcX = srcX;
        this.srcY = srcY;
        this.dstX = dstX;
        this.dstY = dstY;
    }
    return TeleportLink;
})();
//Teleport link coordinates
//Format: sourceX, sourceY, destX, destY
var TELEPORT_LINKS = [
    new TeleportLink(19, 6, 17, 8),
    new TeleportLink(24, 7, 48, 7),
    new TeleportLink(36, 22, 48, 7),
    new TeleportLink(43, 6, 17, 8),
    //Teleport Loop
    new TeleportLink(22, 33, 26, 44),
    new TeleportLink(26, 33, 30, 44),
    new TeleportLink(30, 33, 38, 44),
    new TeleportLink(38, 33, 26, 44),
    new TeleportLink(34, 33, 85, 49),
    //Spaceship
    new TeleportLink(97, 13, 53, 16),
    new TeleportLink(49, 19, 58, 22),
    new TeleportLink(66, 19, 53, 16),
    new TeleportLink(49, 25, 53, 16),
    new TeleportLink(66, 25, 58, 28),
    new TeleportLink(49, 31, 58, 34),
    new TeleportLink(66, 31, 53, 16),
    new TeleportLink(49, 37, 58, 40),
    new TeleportLink(66, 37, 53, 16) //Challenge 4 - r - fail
];
/**
 * Key code constants
 */
var Keys = (function () {
    function Keys() {
    }
    Keys.LEFT = 37;
    Keys.UP = 38;
    Keys.RIGHT = 39;
    Keys.DOWN = 40;
    return Keys;
})();
var Game = (function () {
    function Game(lcd, tiles) {
        this.lcd = lcd;
        this.keys = new Array(256);
        this.world = new World(this, tiles);
        lcd.canvas.onkeydown = function (evt) {
            var k = evt.keyCode;
            //if (this.keys[k])
            //return;
            this.keys[k] = true;
            //Don't block input loop
            setTimeout(function () {
                var player = this.world.player;
                switch (k) {
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
        lcd.canvas.onkeyup = function (evt) {
            this.keys[evt.keyCode] = false;
        }.bind(this);
    }
    Game.prototype.flashScreen = function () {
        var game = this;
        setTimeout(function () {
            game.lcd.drawScreenInverted();
            setTimeout(function () { return game.redrawGame(); }, 150);
        }, 0);
    };
    Game.prototype.redrawGame = function () {
        var _this = this;
        var player = this.world.player;
        var entities = this.world.entities;
        var minX = player.roomX;
        var minY = player.roomY;
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 4; x++) {
                this.lcd.setPixel(x, y, this.world.getTile(x + minX, y + minY));
            }
        }
        _.filter(entities, function (e) { return e.roomX === minX && e.roomY === minY; })
            .forEach(function (e) { return _this.lcd.setPixel(e.x - minX, e.y - minY, e.color); });
        this.lcd.drawScreen();
    };
    Game.prototype.launch = function () {
        this.redrawGame();
    };
    return Game;
})();
function main() {
    var canvas = document.getElementById("game_canvas");
    canvas.focus();
    var lcd = new LCD(canvas);
    var req = new XMLHttpRequest();
    req.onload = function () {
        var tiles_in = JSON.parse(req.response);
        var tiles = new Uint8Array(tiles_in);
        var game = new Game(lcd, tiles);
        game.launch();
    };
    req.open("GET", "world.json", true);
    req.send();
}
