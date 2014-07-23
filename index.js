var mongoose = require('mongoose');
var async = require ('async');
var _ = require ('lodash');


function FixturePrep(){
    this.models_created = [];
}
FixturePrep.prototype.create = function create(items, done){
    var that = this;
    var create_array = function create_array(item, done){
        var Model = mongoose.model(item.model);
        that.models_created.push(Model);
        var items = [];
        async.eachSeries(item.val,function(val, cb){
            var model = new Model(val);
            model.save(function(err, result){
                if(err) console.log(err);
                items.push(result);
                cb();
            });

        },function(){
            that[item.name] = items;
            done();
        });
    };

    var create_item = function create_item(item, callback){

        if(item.val instanceof Array){
            create_array(item,callback);
        }
        else{
            var Model = mongoose.model(item.model);
            that.models_created.push(Model);
            var val;
            if(_.isFunction(item.val)){

                val= item.val(that);

            }
            else{
                val = item.val;
            }
            var m = new Model(val);
            m.save(function(err,result){
                if(err){
                    console.log(err);
                }
                that[item.name] = m;
                callback()
            });
        }

    };
    async.eachSeries(items, create_item,function(){
        done();
    });
};
FixturePrep.prototype.clean_up = function clean_up(done) {

    async.each(_.uniq(this.models_created),

        function cleanUpCallback(model,callback){

            if(model) model.collection.drop(function(err){
                callback();
            });
    },
    done
    );
};

module.exports = FixturePrep;