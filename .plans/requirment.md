# API Mason

**Goal: Tool that allows to orchestrate API call falls like a flowchat but with  blocks that allows user to run that orchestration. This will run the apis sequntailly passing data to next call or running if condition, delay, polling blocks that gives customisation.** 

**Requirements :**

I want to build a tool that can accept postman collection and a environment (usally these files are jsons). And the tool will accept that and reads the collection. And allows user to drag and drop the api to the girded canvas. 

It should have a save button, play button to trigger a orchestration

Should allow users to create multiple orchestrations.

Orchestration should be sharable and there should be a way to import orchestration as well (We dont have to worry whether users has the collection and env, if they want we just need to give them the orchestration then user can do its own work to run it)

Response should be able to pass from 1 block to another block we can use python way of accessing data or jsonpath which ever is easier. 

There should be prebuilt blocks for if conditions, delays, and polling. 

**Deployments:**

 For now local sqlite and containerise application is fine. it should persist the data for future even in local. 

Later on not immediatly (Should be able to containerise this, and also should be able to deploy on vercel with supabase db support later on,)

**SImilar products:**

Mostly close to Postman Flows

N8n