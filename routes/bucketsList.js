var express = require('express');
var router = express.Router();

router.get('/bucketslist', function(req, res) {
    res.send('Здесь будет список бакетов')
})

module.exports = router;