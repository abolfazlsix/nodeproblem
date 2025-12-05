const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { SECRET } = require('../middleware/auth');

router.post('/register', async (req,res)=>{
  try{
    const { username, firstName, lastName, password } = req.body;
    if(!username || !password) return res.status(400).json({message:'username and password required'});
    // username must be ascii letters/numbers/_. ensure unique
    const existing = await User.findOne({ where: { username }});
    if(existing) return res.status(400).json({message:'username taken'});
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, firstName, lastName, passwordHash: hash });
    const token = jwt.sign({ id: user.id }, SECRET);
    res.json({ token, user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatar:user.avatar }});
  }catch(e){
    console.error(e);
    res.status(500).json({message:'server error'});
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username }});
    if(!user) return res.status(400).json({message:'invalid credentials'});
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(400).json({message:'invalid credentials'});
    const token = jwt.sign({ id: user.id }, SECRET);
    res.json({ token, user: { id: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName, avatar:user.avatar, interactionsCount: user.interactionsCount }});
  }catch(e){
    console.error(e);
    res.status(500).json({message:'server error'});
  }
});

module.exports = router;
