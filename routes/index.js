var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // let header = req.headers
  // res.send(header);
  try {
    let headers = req.headers
    if(headers.authorization == ""){
      throw {message: "authorization not null", status: 401}
    }
    return res.status(200).send({
      data: headers,
      message: "get success"
    });
  } catch (error) {
    return res.status(error.status || 500).send({
      message: error.message
    });
  }
});

router.get('/index/:name', function(req, res, next) {
  try{
    let param = req.params
    console.log(param)
    if(param == ""){
      throw {
        message: "not find",
        status: 404
      }
    }
    return res.status(200).send({
      data: param,
      message: "get success"
    });
  }catch (error){
    return res.status(400).send({
      message: error
    });
  }
  
});

router.post('/grade', function(req, res, next) {
  try{
    let body = req.body
    let totalGPA = 0

    let newSubject = body.map((subjects) => {
      if(subjects.score >= 80) {
        subjects.grade = 'A'
        totalGPA += 4
      }else if(subjects.score >= 70) {
        subjects.grade = 'B'
        totalGPA += 3
      }else if(subjects.score >= 60) {
       subjects.grade = 'C'
        totalGPA += 2
      }else if(subjects.score >= 50) {
        subjects.grade = 'D'
        totalGPA += 1
      }else {
        subjects.grade = 'E'
        totalGPA += 0
      }
      delete subjects.score
      
      return subjects
    })
    
    /*
    for(let i = 0; i < body.length; i++) {
      console.log(body[i])
      if(body[i].score > 100 || body[i].score < 0) {
        throw {
          message: "score must be 0-100",
          status: 400
        }
      }
      
      if(body[i].score >= 80) {
        body[i].grade = 'A'
        totalGPA += 4
      }else if(body[i].score >= 70) {
        body[i].grade = 'B'
        totalGPA += 3
      }else if(body[i].score >= 60) {
        body[i].grade = 'C'
        totalGPA += 2
      }else if(body[i].score >= 50) {
        body[i].grade = 'D'
        totalGPA += 1
      }else {
        body[i].grade = 'E'
        totalGPA += 0
      }
      delete body[i].score
    }
    */
    console.log(newSubject)
    // console.log(totalGPA)

    let gpa = (totalGPA / body.length)
    console.log(`${totalGPA} / ${body.length} = ${gpa}`)

    return res.status(200).send({
      data: {
        subject: newSubject,
        GPA: gpa.toFixed(2)
      },
      message: "success"
    });
  }catch (error){
    return res.status(error.status || 500).send({
      message: error.message
    });
  }
});

router.put('/', function(req, res, next) {
  return res.send('Hello method put');
});

router.delete('/', function(req, res, next) {
  let query = req.query
  console.log(query)
  return res.send(query);
});

module.exports = router;
