<h1>Course Pre-requisite visualizer</h1>


<h2>Features</h2>


<ul>


  <li>Course pre-requisites visualization</li>


  <li>Complete degree structure</li>


  <li>An AI helper, that helps by remaining strictly inside the domain of your degree</li>

  <li>Course search page, where you can search about any course</li>

  <li>Less confusion and ease of access</li>



</ul>


<h2>Detailed Explanation of Features</h2>


<p>So, for understanding your degree structure you can head over to the degrees page and select Degree, whose structure you want to see. To see a course full details, click on the course. You will be navigated to search page, with details of that course.</p>


<p>For visualizing the data go the Pre-requisite visualizer page and select your degree as there are a lot of courses so they are separated by degrees. There each component shows course relationship</p>

<p>There is CPV AI. So you select a degree and you can ask any questions to it about the degree. It will answer your questions by remaining in that degrees domain. It is abit slow but it works.</p>

<p>There is course search page that tells all details about that course</p>

<p>The website also has an admin dashboard. It is not among the best but it does what is required and of course it is authorized to admins only.</p>


<p>This website contains a bit of designing like not much but still I tried to use a theme and kinda keep up with it.</p>


<h2>Making of site</h2>


<p>So I am learning about website and web technologies and I wanted to kinda work with databases and their models. So while developing this I kinda learned alot about complex queries like thinking and then forming those especially in sql alchemy(a python orm). I started simple with just courses and then I decided there should be degrees too like courses could then be categorized into degrees.</p>

<h2>Trying this project locally</h2>
<p>As mentioned this porject uses an admin dashboard like that is the main purpose of the project, but while on deployment not everyone can be given access to it. So try this project locally.</p>

## How to Run

### Clone the Repository
```bash
git clone https://github.com/mohammad-ans/Course-Prerequisite-Visualizer.git
cd Course-Prerequisite-Visualizer

cd cpv
npm install
npm run dev
```
<p>Open a second terminal in the same folder(Course-Prerequisite-Visualizer) and then</p>

```
cd Backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload
```
<p>Now three main things remain. </p>
<ol>
  
  <li>First in api.jsx that is located in /cpv/src/, change the default url to http://localhost/[port]. Here port is the number on which your uvicorn server is running</li>
  <li>In auth.py that is located in /Backend. Change the verify token function to just return {"username" : "username", "type" : "admin".</li>
  <li>Last part is to create a postgres database and add its url to a .env file in /Backend such as DATABASE_URL = [The Url]</li>
</ol>
<p>After this, you can test all features of the database easily and smoothly.</p> 
## Note you cannot use the ai page on student area now as that requires an api key. You can generate yours from OPENROUTER if you want and add it to .env.

<h2>Usage of AI</h2>
<p>AI was used kind of like search like I forgot a keyword for something and I search and web default AI shows it.</p>
