import {Socket} from "phoenix"

var socket = new Socket("/socket");
socket.connect();
var channel = socket.channel("rooms:lobby", {});
channel.join();


window.onload = function(){

    var createCanvas = function(count) {
      var canvasWidth = window.innerWidth/2 -40,
          $canvas = $('<canvas id="demoCanvas' + count + '" class="main-canvas" width="' + canvasWidth + '" height="600"></canvas>').appendTo('main'),
          canvas = new fabric.Canvas($canvas[0]),
          defaultOptions = {
            left: 100,
            top: 100,
            backgroundColor: '#f7e6ce',
            width: 200,
            height: 200,
            shadow: {
              color: 'rgba(0, 0, 0, 0.3)',
              blur: 1,
              offsetX: 1,
              offsetY: 1
            }
          },
          defaultFrameOptions = {
            left: 1300,
            top: 100,
            stroke: '#444',
            strokeWidth: 5,
            fill: 'transparent',
            width: 300,
            height: 300
          },
          colors = [
            ['yellow', '#f7e6ce'],
            ['pink', '#f7ced3'],
            ['blue', '#cee9f7'],
            ['green', '#d0f7ce']
          ],
          object_types = [
            'sticky',
            'frame'
          ],
          currentObjectType = object_types[0],
          $colorButtons = (function(){
            var $buttonsBox = $('<div>');
            colors.forEach(function(color){
              var $button = $('<label><input type="radio" name="color_'+count+'">' + color[0] + '</label>');
              $button.on('click', function() {
                defaultOptions.backgroundColor = color[1];
              });
              $buttonsBox.append($button);
            });
            $buttonsBox.find('input').first().attr('checked', true);
            return $buttonsBox;
          })().prependTo('main'),
          $objectButtons =  (function(){
            var $buttonsBox = $('<div>');
            object_types.forEach(function(object_type){
              var $button = $('<label><input type="radio" name="object_type_'+count+'">' + object_type + '</label>');
              $button.on('click', function() {
                currentObjectType = object_type;
              });
              $buttonsBox.append($button);
            });
            $buttonsBox.find('input').first().attr('checked', true);
            return $buttonsBox;
          })().prependTo('main'),
          id_counter = 0;

      //デフォルト選択スタイル設定
      $.extend( fabric.Object.prototype, {
        borderColor: 'rgba(0, 100, 255, 0.3)',
        cornerColor: 'rgba(0, 100, 255, 0.3)',
        cornerSize: 8,
        transparentCorners: false,
        padding: 5,
        originX: 'center',
        originY: 'center'
      });

      function animate(e, dir, callback) {
        if (e.target) {
          var org_scaleX = e.target.get('scaleX'),
              org_scaleY = e.target.get('scaleY');
          fabric.util.animate({
            startValue: 1,
            endValue: dir ? 1.02 : 1/1.02,
            duration: 50,
            onChange: function(value) {
              e.target.setScaleX(org_scaleX*value);
              e.target.setScaleY(org_scaleY*value);
              canvas.renderAll();
            },
            onComplete: function() {
              e.target.setCoords();
              if(callback) callback(e);
            }
          });
        }
      }

      var mouseDowned = { state: false, target: null },
          selectionCleared = { state: false, target: null };

      canvas.on('object:selected', function(e) {
        console.log('object:selected');
        console.log(e);
      });

      canvas.on('selection:cleared', function(e) {
        console.log('selection:cleared');
        selectionCleared = { state: true, target: e.target };
        console.log(e);
      });

      canvas.on('mouse:down', function(e) {
        console.log('mouse:down');
        mouseDowned = { state: true, target: e.target };
        console.log(e)
      });

      canvas.on('mouse:move', function(e) {
        mouseDowned = { state: false, target: null };
        selectionCleared = { state: false, target: null };
      });

      canvas.on('mouse:up', function(e) {
        console.log('mouse:up');
        if( mouseDowned.state ) {
          if( !mouseDowned.target ) {
            //直前に選択状態が解除された場合は作らない
            if( selectionCleared.state ) {
              selectionCleared = { state: false, target: null };
              return;
            }

            var mouse_start_pos = canvas.getPointer(e.e);
            if(currentObjectType === object_types[0]) { //stickyなら
               channel.push("sticky:create", {
                left: mouse_start_pos.x,
                top: mouse_start_pos.y,
                backgroundColor: defaultOptions.backgroundColor
               });
            } else { //frameなら
               channel.push("frame:create", {
                left: mouse_start_pos.x,
                top: mouse_start_pos.y
               });
            }
          } else {
            canvas.trigger('mouse:click', e);
          }
        }
        selectionCleared = { state: false, target: null };
        console.log(e)
      });

      canvas.on('mouse:click', function(e) {
        console.log('mouse:click');
        console.log(e);
        animate(e, 1, function(e){ animate(e, 0); });
      });

      canvas.on('object:modified', function(e) {
        console.log('object:modified');
        console.log(e);

        if(typeof e.target.id === 'number') {
          var target = e.target;

          // typeがi-textかrectかで処理を分ける(テキストを持っているかどうか)
          if(target.get("type") === "i-text"){
            channel.push('sticky:modified', {
              text: target.getText(),
              id: target.id,
              left: target.left,
              top: target.top,
              width: target.width,
              height: target.height,
              scaleX: target.scaleX,
              scaleY: target.scaleY,
              angle: target.angle,
              group_left: null,
              group_top: null,
              group_width: null,
              group_height: null,
              group_scaleX: null,
              group_scaleY: null,
              group_angle: null
            });
          }else{
            channel.push("sticky:modified", {
              text: null,
              id: target.id,
              left: target.left,
              top: target.top,
              width: target.width,
              height: target.height,
              scaleX: target.scaleX,
              scaleY: target.scaleY,
              angle: target.angle,
              group_left: null,
              group_top: null,
              group_width: null,
              group_height: null,
              group_scaleX: null,
              group_scaleY: null,
              group_angle: null
            });
          } 
        } else {
          var parent = e.target,
              parentOrg = parent.getPointByOrigin(); //TODO:ここでlocalPointからglobalPointに変換したい
          e.target._objects.forEach( function(target) {
            console.log('each');
            // typeがi-textかrectかで処理を分ける(テキストを持っているかどうか)
            if(target.get("type") === "i-text"){
              channel.push('sticky:modified', {
                text: target.getText(),
                id: target.id,
                left: target.left,
                top: target.top,
                width: target.width,
                height: target.height,
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                angle: target.angle,
                group_left: parent.left,
                group_top: parent.top,
                group_width: parent.width,
                group_height: parent.height,
                group_scaleX: parent.scaleX,
                group_scaleY: parent.scaleY,
                group_angle: parent.angle
              });
            }else{
              channel.push('sticky:modified', {
                text: null,
                id: target.id,
                left: target.left,
                top: target.top,
                width: target.width,
                height: target.height,
                scaleX: target.scaleX,
                scaleY: target.scaleY,
                angle: target.angle,
                group_left: parent.left,
                group_top: parent.top,
                group_width: parent.width,
                group_height: parent.height,
                group_scaleX: parent.scaleX,
                group_scaleY: parent.scaleY,
                group_angle: parent.angle
              });
            }
          });
        }
      });

      channel.on("sticky:create", function(config){
        //矩形オブジェクトを作る
        var sticky = new fabric.IText("テキスト",$.extend({}, defaultOptions, {
          id: id_counter,
          left: config.left,
          top: config.top,
          backgroundColor: config.backgroundColor
        }));

        // テキストを持っていればセットする、パラメータで入れれなそうなのでここでセット
        if(config.text){
          sticky.setText(config.text);
        }

        id_counter++;

        // canvas 上に矩形を追加する
        canvas.add(sticky);
      });

      // 角度をラジアンに変換
      Math.degrees = function(radians) {
        return radian * 180 / Math.PI;
      };
      var radian, group_radian, r, x, y;

      channel.on("sticky:modified", function(config){
        console.log('sticky:modified');
        var sticky = canvas.getObjects().find(function(o){ return o.id === config.id });
        console.log(canvas);
        console.log(sticky);
        console.log(config);
        if(config.group_left != null　&& sticky.group) { //送信側も受信側もグループ　の時
          // var point = sticky.group.toLocalPoint(new fabric.Point(config.left, config.top), 'center', 'center');
          sticky.text = config.text;
          sticky.left = config.left;
          sticky.top = config.top;
          sticky.width = config.width;
          sticky.height = config.height;
          sticky.scaleX = config.scaleX;
          sticky.scaleY = config.scaleY;
          sticky.angle = config.angle;
          sticky.group.left = config.group_left;
          sticky.group.top = config.group_top;
          sticky.group.width = config.group_width;
          sticky.group.height = config.group_height;
          sticky.group.scaleX = config.group_scaleX;
          sticky.group.scaleY = config.group_scaleY;
          sticky.group.angle = config.group_angle;
        } else if(config.group_left != null　&& !sticky.group) { //送信側がグループ、受信側が単独　の時
          r = Math.sqrt(Math.pow((config.left),2) + Math.pow((config.top),2)); //group原点からsticky中央までの距離（半径として扱う）
          radian = Math.atan2(config.top, config.left);　//group原点からsticky中央までのラジアン(角度)
          group_radian = radian + (config.group_angle / 180 * Math.PI) //groupが傾いた時のstickyのラジアン
          x = r * Math.cos(group_radian);  // group原点からのX座標
          y = r * Math.sin(group_radian);  // group原点からのY座標
          // ↑メソッドにまとめた方が良いでしょうか？
          sticky.text = config.text;
          sticky.left = x * config.group_scaleX + config.group_left;
          sticky.top =  y * config.group_scaleY + config.group_top;
          sticky.width = config.width;
          sticky.height = config.height;
          sticky.scaleX = config.scaleX * config.group_scaleX;
          sticky.scaleY = config.scaleY * config.group_scaleY;
            if(config.angle === 0){sticky.angle = config.group_angle}
            else if(config.group_angle === 0){sticky.angle = config.angle}
            else{sticky.angle = config.angle * config.group_angle};
        } else if(config.group_left === null　&& sticky.group) { //送信側が単独、受信側がグループ　の時
          sticky.text = config.text;
          sticky.left = config.left - sticky.group.left;
          sticky.top = config.top - sticky.group.top;
          sticky.width = config.width;
          sticky.height = config.height;
          sticky.scaleX = config.scaleX/sticky.group.scaleX;
          sticky.scaleY = config.scaleY/sticky.group.scaleY;
          sticky.angle = config.angle/sticky.group.angle;
          sticky.group.left = sticky.group.left;
          sticky.group.top = sticky.group.top;
          sticky.group.width = sticky.group.width;
          sticky.group.height = sticky.group.height;
          sticky.group.scaleX = sticky.group.scaleX;
          sticky.group.scaleY = sticky.group.scaleY;
          sticky.group.angle = sticky.group.angle;
        }else{　//送信側も受信側も単独のとき
          sticky.text = config.text;
          sticky.left = config.left;
          sticky.top = config.top;
          sticky.width = config.width;
          sticky.height = config.height;
          sticky.scaleX = config.scaleX;
          sticky.scaleY = config.scaleY;
          sticky.angle = config.angle;
        }
        sticky.setCoords();
        canvas.renderAll();
      });

      channel.on('frame:create', function(config){
        var frame = new fabric.Rect($.extend({}, defaultFrameOptions, {
          id: id_counter,
          left: config.left,
          top: config.top
        }));
        id_counter++;

        canvas.add(frame);
        canvas.sendToBack(frame);
      });
    }

    for(var i=0; i < 2; i++) {
      createCanvas(i);
    }
}