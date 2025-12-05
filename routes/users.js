// routes/users.js
const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const multer = require('multer');
const path = require('path');

// Multer برای آپلود فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// -------------------------
// GET /api/users/:username
// -------------------------
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
      include: [
        {
          model: Post,
          include: [
            { model: User, attributes: ['id','firstName','lastName','username','avatar'] },
            { model: Comment, include: [{ model: User, attributes: ['id','firstName','lastName','username','avatar'] }] }
          ]
        }
      ]
    });

    if(!user) return res.status(404).json({ message: 'User not found' });

    const posts = user.Posts.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ user: { ...user.toJSON(), posts } });

  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
});


// -------------------------
// PUT /api/users/:id  (Edit Profile)
// -------------------------
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName } = req.body;
    
    let avatar = user.avatar;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    await user.update({
      firstName,
      lastName,
      avatar
    });

    res.json({ user });

  } catch(e) {
    console.log(e);
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
