// postsRoutes.js
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, attributes: ['id','firstName','lastName','username','avatar'] },
        { model: Comment, include: [{ model: User, attributes: ['id','firstName','lastName','username','avatar'] }] }
      ],
      order: [['createdAt','DESC']]
    });
    res.json({ posts }); // شامل پست عادی و همه دسته‌بندی‌ها
  } catch(e) {
    console.log(e);
    res.status(500).json({ message: 'Server error' });
  }
});
