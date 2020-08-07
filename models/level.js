// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var levelSchema = new Schema({
  level: { type: String, required: true, unique: true },
  name: { type: String, required: true},
  score: { type: Number, required: true },  
  created_at: Date,
  updated_at: Date
});

// custom method to add string to end of name
// you can create more important methods like name validations or formatting
// you can also do queries and find similar users 
levelSchema.methods.dudify = function() {
  // add some stuff to the users name
  this.name = this.name + '-dude'; 

  return this.name;
};

module.exports = function() {
  var Level = mongoose.model('AsteroidLevel', levelSchema);

  var levels = ["level_1", "level_2", "level_3", "level_4"];
  
  function doCreate(data){
    var newLevel = new Level({
      level: data.level,
      name: data.name,
      score: data.score 
    });
    newLevel.save(function(err){
      if(!err)throw err;
    })
  }

  function init(){
     doCreate({level: "level_1", name: "sam", score: 10});
      doCreate({level: "level_2", name: "tom", score: 20});
      doCreate({level: "level_3", name: "harry", score: 30});  
      
      function cb(){}
      setLeader(0, 10, "sam", cb)
      setLeader(1, 20, "tom", cb)
      setLeader(2, 30, "harry", cb)
      
     }
  
//init();


  function getLeader(level, cb){
    Level.findOne({level: levels[level]}, cb);
  }

  function setLeader(level, score, name, cb){
    Level.update({level: levels[level]}, {level: levels[level], name: name, score: score}, /*{},*/ function(err, obj){
      if(err){        
        throw "Update failed";
      }
      cb(null, {level: levels[level], name: name, score: score})
    });
  }
  // [START exports]
  return {
      getLeader: getLeader,
      setLeader: setLeader
  };
  // [END exports]
};