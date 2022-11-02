"use strict";
const express = require('express');
const router = express.Router();
const db = require('../../models/db');
const {getMatchInfo} = require("../../models/LolApiRequest")

router.get("/:matchId/:userPuuid", async function(req, res, next) {
    const {matchId, userPuuid} = req.params;
    const matchObj = await getMatchInfo(matchId)
    db.addMatch(matchObj, userPuuid).then((response)=>{
        console.log(response);
        res.send(response);
    }).catch((e)=> console.error(e))
});



module.exports = router;