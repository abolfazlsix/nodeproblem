const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Post, User, Like, Comment } = require('../models');
const { authMiddleware } = require('../middleware/auth');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads/') });

// create post
router.post('/', authMiddleware, upload.single('image'), async (req,res)=>{
  try{
    const { title, description, category, contact } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    // restrict categories to known set
    const categories = ['problems','war_damage','normal','volunteer','donation'];
    if(!categories.includes(category)) return res.status(400).json({message:'invalid category'});
    // normal posts only allowed to be created by user? user requested p. It's fine.
    const post = await Post.create({ title, description, image, category, contact, userId: req.user.id });
    res.json(post);
  }catch(e){
    console.error(e);
    res.status(500).json({message:'server error'});
  }
});

// list by category (paginated simple)
router.get('/category/:cat', async (req,res)=>{
  const cat = req.params.cat;
  const categories = ['problems','war_damage','normal','volunteer','donation'];
  if(!categories.includes(cat)) return res.status(400).json({message:'invalid category'});
  const posts = await Post.findAll({ where: { category: cat }, include: [{ model: User, attributes: ['id','username','firstName','lastName','avatar'] }], order:[['createdAt','DESC']]});
  res.json(posts);
});

// explore - all posts
router.get('/explore', async (req,res)=>{
  const posts = await Post.findAll({ include: [{ model: User, attributes: ['id','username','firstName','lastName','avatar'] }], order:[['createdAt','DESC']]});
  res.json(posts);
});

// get single post with comments & like count
router.get('/:id', async (req,res)=>{
  const post = await Post.findByPk(req.params.id, { include: [
    { model: User, attributes: ['id','username','firstName','lastName','avatar'] },
    { model: Comment, include: [{ model: User, attributes:['id','username','firstName','lastName','avatar'] }] },
    { model: User, as: 'Likers', attributes: ['id'] }
  ]});
  if(!post) return res.status(404).json({message:'not found'});
  // likes count:
  const likesCount = (post.Likers || []).length;
  res.json({ post, likesCount });
});

// like/unlike
router.post('/:id/like', authMiddleware, async (req,res)=>{
  const post = await Post.findByPk(req.params.id);
  if(!post) return res.status(404).json({message:'not found'});
  // toggle
  const existing = await Like.findOne({ where: { userId: req.user.id, postId: post.id }});
  if(existing){
    await existing.destroy();
    // reduce interaction? we will recalc interactions
  }else{
    await Like.create({ userId: req.user.id, postId: post.id });
  }
  // update user's interaction counts for medal: we increment post owner interactions
  const likesCount = await Like.count({ where: { postId: post.id }});
  const commentsCount = await Comment.count({ where: { postId: post.id }});
  // Recalculate interactions for post owner (sum of likes+comments across their posts)
  const owner = await User.findByPk(post.userId);
  const ownerLikes = await Like.count({ include: [{ model: Post, where: { userId: owner.id } }] }).catch(()=>0);
  // simpler: compute interactions by summing likes + comments across posts:
  const ownerPosts = await Post.findAll({ where: { userId: owner.id }});
  let total = 0;
  for(const p of ownerPosts){
    const lc = await Like.count({ where: { postId: p.id }});
    const cc = await Comment.count({ where: { postId: p.id }});
    total += lc + cc;
  }
  owner.interactionsCount = total;
  await owner.save();
  res.json({ success:true });
});

// add comment
router.post('/:id/comment', authMiddleware, async (req,res)=>{
  const post = await Post.findByPk(req.params.id);
  if(!post) return res.status(404).json({message:'not found'});
  const { text } = req.body;
  if(!text) return res.status(400).json({message:'empty'});
  const comment = await Comment.create({ text, userId: req.user.id, postId: post.id });
  // update owner's interaction count
  const owner = await User.findByPk(post.userId);
  const ownerPosts = await Post.findAll({ where: { userId: owner.id }});
  let total = 0;
  for(const p of ownerPosts){
    const lc = await Like.count({ where: { postId: p.id }});
    const cc = await Comment.count({ where: { postId: p.id }});
    total += lc + cc;
  }
  owner.interactionsCount = total;
  await owner.save();
  res.json(comment);
});

// edit & delete endpoints (only owner)
router.put('/:id', authMiddleware, upload.single('image'), async (req,res)=>{
  const post = await Post.findByPk(req.params.id);
  if(!post) return res.status(404).json({message:'not found'});
  if(post.userId !== req.user.id) return res.status(403).json({message:'forbidden'});
  const { title, description, category, contact } = req.body;
  if(req.file) post.image = `/uploads/${req.file.filename}`;
  post.title = title ?? post.title;
  post.description = description ?? post.description;
  post.category = category ?? post.category;
  post.contact = contact ?? post.contact;
  await post.save();
  res.json(post);
});

router.delete('/:id', authMiddleware, async (req,res)=>{
  const post = await Post.findByPk(req.params.id);
  if(!post) return res.status(404).json({message:'not found'});
  if(post.userId !== req.user.id) return res.status(403).json({message:'forbidden'});
  await post.destroy();
  res.json({ success:true });
});

module.exports = router;
