# prismatic-xdocument

PXD (or whatever) is a non compliant XML database implemented using PrismaDB and served over
GraphlQL. It's API is inspired by what I remembered from XDocument et al.. from the
C# LinQ api.

## Preiminaries
* The Database layer is implemented with PrismaDB. A Docker Compose script is provided

## Install
* Clone Repo
* install with ```npm install``` or ```yarn install```
* Start local dev db with docker-compose up -d
* Start api with ```npm run dev```
* Check http://localhost:4000

## Interesting Features
It's pretty Interesting actually

### Immutability Through Denomarlization
Documents are stored with their attributes and elements (and those recursive elements with their respective attributes)
are stored denormalized in the database. While this structure would be unsuitable
for a multi user document store it provides interesting introspective opportunities
 in curated datasets.


 ### GraphQL Interface
 PXD(ow) serves a graphQL interface poorly referenced from XML LinQ in C#. When
 thoughtfully considering what XML Documents/Elements  might be queried expressive
 searches can be performed


 #### OWL Ontology
 Here is a graphQL query searching for a semantic web style query, "For each class, retrieve their parent class"
 ```graphql
 query($isMother: AttributeMatch){
   elements(name: "owl:Class") {
     name
     elements(name: "rdfs:subClassOf") {
       name
       attributes {
         name
         value
       }
     }
   }
 }
 ```
