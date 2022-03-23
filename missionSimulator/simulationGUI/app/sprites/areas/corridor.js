define(['Phaser',
        './area',
        'app/utils/converters',
        'app/styles'],
    function (Phaser,Area,Converters,Styles) {

        function Corridor(game,graphics,serverVertices) {

            Area.call(this,game,graphics,serverVertices);
        }

        //Inheritance
        Corridor.prototype = Object.create(Area.prototype);
        Corridor.prototype.constructor = Corridor;

        //Replace draw method
        Corridor.prototype.draw = function (color, transparency) {

            if (color!= null && transparency!= null) {
                this.graphics.beginFill(color,transparency);
            } else {
                this.graphics.beginFill(Styles.areas.corridor.color,
                    Styles.areas.corridor.alpha);
            }

            Area.prototype.draw.call(this);
        }

        return Corridor;
    });
