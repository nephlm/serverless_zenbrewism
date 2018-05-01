# serverless_zenbrewism

Serverless version of the zen brewism books website. This document really should be a blog post not a project read me.

**Note**: This repo uses [NoDB](https://github.com/Miserlou/NoDB), which currently is not compatible with python 3, you'll have to use my [updated fork](https://github.com/nephlm/NoDB/tree/minimal_py3), specifically the minimal_py3 branch.  I submitted a pull request and hopefully it will be accepted, or updated to python 3 in some other way.  Due to all this this, NoDB isn't currently in setup.py and needs to be setup manually. 

This repo is for my personal website so I don't see how it's of much interest to anyone, but me six months from now, but if you want to build on similar infrastructure I'll try and layout the steps, but the primary audience for the this documentation is me six months from now.

## Local install

Assuming the code has been checked out somewhere and we start at the root of the repo.

```bash
cd flask
pip install -r requirements.txt
pip install -e <path to NoDB>
pip install -e .
python zenbrewism/start.py
```

Open a new terminal and cd to the root of the repo.

```bash
cd react
# Since this gets served from an s3 bucket it doesn't know where it's backend lives, 
# so it needs a config file to point to the proper url.
<setup the backend pointer: edit react/src/backendConfig.js>
npm run start
```

## Deploy

This can't be done until all the infrastructure is setup as described below.  Again, I'll assume we're starting in the root of the repo.  

```bash
cd flask 
zappa init  # answer a bunch of questions
zappa deploy prod # or dev or whatever.
cd ../react
npm run build
./deploy.sh <name of bucket>
```

Go to your site and it should work.

## Overview and Services

I don't honestly expect much traffic at this site, but an author website is pretty much a cost of doing business when publishing a novel.  So we're talking low traffic, but has to look professional.  To me that means a custom domain name and https.  To a designer it means different things.  

So the cheapest option I had was $5/month for a digital ocean droplet.  There were some cheaper options, but they had limitations or additional costs.  For example wordpress.com with two custom domains looked like it was going to be at least $8/mo and extra to customize a theme and every other little thing.  

So the question was how cheap could I do this for.  Serving static files from s3 on a custom domain is pretty easy, but you need cloudfront to get https.  Still pretty straight forward and cheap for a low traffic site.  But I didn't want to foreclose on the possibility of a sort of cms system.  Or at the very least the ability to write in textile instead of html or something.  

Doing a backend in flask and using zappa to have it run on lambda was something I understood in principle, though I never used it in a production project.  But there were no db options that were cheaper than running a digital ocean droplet.  I was sad.  Then I found NoDB which wrapped s3 in a convenient API, and I was in business.  It won't work for a state manager, but it's fine for a low traffic website.  

The $.085/gb transfer cost should be by far the largest expense by an order of magnitude.  I think the theoretical minimum cost should be $.07/month, but I'll have to see what it looks like in practice once all the bots start hitting it.  If it exceeds $5/mo in your use case you should spin up a digital ocean droplet and run a nginx/gunicorn/flask/react stack instead.  

* Namecheap's standard DNS (Route 53 costs .50/month/domain and it doesn't look like I need it.)
* Amazon Certificate Manager (AMS)
* Simple Storage Service (S3)
* Cloudfront
* API Gateway

## Tools and Libs

* Tools
	* [Zappa](https://github.com/Miserlou/Zappa)
* Backend
	* [Flask](http://flask.pocoo.org/)
	* [Flask-cors](https://github.com/corydolphin/flask-cors)
	* [NoDB](https://github.com/Miserlou/NoDB) -  Note that this isn't in setup.py.  See note at top for discussion of why.
	* Probably other stuff
* Frontend
	* [React](https://reactjs.org/)
	* [Mobx](https://github.com/mobxjs/mobx)
	* [React-Router](https://github.com/ReactTraining/react-router/tree/master/packages/react-router)
	* [Axios](https://github.com/axios/axios)
	* [Bootstrap](https://getbootstrap.com/)
	* [Textile-js](https://github.com/borgar/textile-js)
	* Probably other stuff

## Setup Infrastructure

### Certificate Manager

[Amazon Certificate Manager](https://console.aws.amazon.com/acm/home?region=us-east-1#/)

This is super easy so might as well get it out of the way.

* Click request a certificate.
* Add all the domain names.  I recommend the bare name and wildcard name for each domain you might want to serve the content from.  Note that you can't change the list later without creating a new cert and updating all the services so I'd recommend going broad here.
* Click next.
* Select email validation
* Click Review.
* Click Confirm and Request
* You'll receive about a billion emails.  Maybe closer to 6 per domain name you requested on the cert.  There's no easy way to tell them apart so just start approving until all the domain names are accepted.  I had good success approving the first one and the last one in the email chain and then checking.

### Static Files

[Simple Storage Service (s3)](https://s3.console.aws.amazon.com/s3/home?region=us-east-1#)

* Create a new bucket
* A lot of docs say the bucket has to have the same name as the domain, based on other stuff, it doesn't seem like it should be a requirement, but I haven't tested it, so there's that.  This may be more relevant if you use route 53 as your DNS provider.
    * Bucket names are globally unique across all AWS users, so using your domain name is likely to decrease the chance of conflict anyway.
* Give it a name, click next.
* Leave the properties as they are and click Next.
* Select "Grant public read access to this bucket" from the public permissions drop down and and click next. 
* Click Create Bucket
* Select the new bucket and click the properties tab
* Enable Static Website Hosting
* Set the index document to `index.html` and the error doc to `error.html` and click Save.
* Logging should probably be activated, but I haven't looked at that yet.
* Select the Permissions Tab and select Bucket Policy
* Paste the below:

```json
{
    "Version": "2008-10-17",
    "Id": "Policy1397632521960",
    "Statement": [
        {
            "Sid": "Stmt1397633323327",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::www.example.com/*"
        }
    ]
}
```

* Replace `www.example.com` with your bucket name.
* Big warning comes up.  About how the public can now read your bucket, which is sort of the point, so feel free to ignore it or do whatever you need to do to come to terms with it.
* Click Save.
* (Optional) Go into the ACL and remove Everyone's permission to list objects.

### Content Distribution Network

Sigh.  I didn't want to have to do this, but s3 can't serve https traffic under a custom domain name and so a cloudfront distribution needs to be set up. 

[Cloudfront](https://console.aws.amazon.com/cloudfront/home?region=us-east-1#)

* Click Create Distribution
* Select the `Web` Get Started.
* Under Origin Domain Name select your s3 bucket from the drop down.
* (Optional)While you're getting things up or for a staging server you may want to set Object caching to Customize and change the Maximum TTL to 60.  
* Set Price Class to US/Can/Eur to save money.
* **Very Important** and easy to miss.  Fill in your alternate domain names.  This is all the domain names which should resolve to this content.
* Choose Custom SSL Cert and select your cert from the drop down.
* **Do not** Choose the $600/mo dedicated IP.  SNI should work for just about everyone.
* Set default root object to `index.html`
* Should probably do something with logs, but that's for later.
* Accept the defaults for the rest.  
* Click Create Distribution
* Make note of your cloudfront domain name, you'll need it later.

### Backend API

[API Gateway](https://console.aws.amazon.com/apigateway/home?region=us-east-1#/apis)

API Gateway is created and managed by zappa.

* Create your virtualenv and install all the requirements from setup.py and requirements.txt.  You should be able to run `start.py` and `curl http://localhost:5000/test` without any issues.  
* Deploy a stage `zappa deploy dev` (or prod, or whatever stage you're setting up).
* Go to the API GW console
* Click on `Custom Domain Names` and click on `Create Custom Domain Name`
* Fill in a domain name (api.example.com or whatever) 
* Click Regional
* Select your wildcard cert from the dropdown.
* Leave path blank, select the API in destination and select the stage you just created.
* Make a note of the target domain name, you'll need it in the next step.

Note that you'll have to create one of these for each stage you want to have accessible so  you might want to create an `api.example.com` and an `devapi.example.com` or something.

### Nameserver Configuration

I used namecheap for my name registration dns resolution for this project.  It has the capability to redirect a bare (e.g. `example.com`) http request to a host/subdomain (e.g.  http://www.example.com/)  I have that set up for my domain.  It also has email forwarding which makes all that cert verification easier.  I can't say how a different registrar will handle those things.  In any case it comes with my domain so using route 53 is money I don't need to spend.  Not a lot, but... why?

You'll need to create two cname records one pointing at cloudfront and the other at the API GW.  Those are the two domains I mentioned earlier.

For mine the host `api` is pointed to the API GW, and the host `www` is pointed to the cloudfront domain.  

And with that, your infrastructure is all built.  I should turn it into a proper script at some point, but not worth it at the moment.

## Deploy/Update

To get this far you've already deployed the backend, but we'll go into a bit more detail here.   

I'm a pyenv guy, but setting up a basic virtual env is a bit out of scope for this document and covered in great detail by blogs all over the Internet.  So I'll just assume you have a pristine new python 3.6 virtualenv at this point. [If not.](http://fgimian.github.io/blog/2014/04/20/better-python-version-and-environment-management-with-pyenv/)

This document needs to be restructured, but you can now run the Deploy section at the very top of this document.  

To update you use `zappa update <stage>` instead of `deploy`, but otherwise everything else is the same. 




