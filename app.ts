import Express from './src/Express'

const app = new Express()

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url} from ${req.ip}`)
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
