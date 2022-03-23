define(['Phaser',
    'app/game',
    'app/constants',
    'app/props',
    'app/styles',
    'app/utils/converters'], function (Phaser, game, Constants,Props,Styles,Converters) {

    function GCS (data) {

        var clientPosition = Converters.clientCoordConverter(data.position);
        //Super constructor
        Phaser.Sprite.call(this,
            game,
            clientPosition.x,
            clientPosition.y,
            Constants.gcs.asset.key,
            0);
        this.anchor.setTo(0.5,0.5);
        this.alpha = 1;
        this.scale.x = Constants.gcs.sprite.scale.x;
        this.scale.y = Constants.gcs.sprite.scale.y;

        this.data = data;
        this.id = data.id;

        //Sprite input

        //Text information
        this.label = new Phaser.Text(game,
                                    0,
                                    this.height,
                                    (this.data.name != null) ? this.data.name : this.data.id,
                                    Styles.gcs.label);
        this.label.anchor.setTo(0.5,0);
        this.addChild(this.label);

        //Auto-add the sprite to the game here in the constructor
        game.add.existing(this);
        this.z = Props.zOrder.indexOf('gcss');
    }

    //Inheritance
    GCS.prototype = Object.create(Phaser.Sprite.prototype);
    GCS.prototype.constructor = GCS;

    GCS.prototype.updateFromServer = function(data) {
    };

    /************************************
     ** CALLBACKS
     ************************************/

    return GCS;
});