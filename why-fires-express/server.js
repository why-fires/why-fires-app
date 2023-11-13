const express = require('express');
const app = express();
const PORT = 5000;

// Serve static files from 'public' directory
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
