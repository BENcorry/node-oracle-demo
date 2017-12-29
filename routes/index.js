const router = require('koa-router')()


router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/element', async (ctx, next) => {
  await ctx.render('/element/elementConfig', {
    title: 'Hello Koa 2!'
  })
})

router.get('/detail', async (ctx, next) => {
  await ctx.render('/element/elementDetail', {
    title: 'Hello Koa 2!'
  })
})

module.exports = router
