import http from 'http';
import app from 'file:///C:/Users/GIB/OneDrive/Desktop/hackathon/jansambandha/backend/src/server.js';
import ProjectProposal from 'file:///C:/Users/GIB/OneDrive/Desktop/hackathon/jansambandha/backend/src/models/ProjectProposal.js';

ProjectProposal.create = async (input) => ({ _id: '507f1f77bcf86cd799439099', ...input });

const server = http.createServer(app);
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

async function post(body){
  const res = await fetch(`http://127.0.0.1:${port}/api/v1/project-proposals`, {
    method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log(res.status, text);
}

await post({});
await post({
  title:"Road Repair", description:"Fix potholes", wardId:"507f1f77bcf86cd799439011",
  category:"Infrastructure", location:"Ward 3", estimatedBudget:50000,
  fiscalYear:"2082/83", justification:"Safety"
});
server.close();
