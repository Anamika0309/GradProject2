import json
import uuid
from datetime import datetime, timezone
from database import SessionLocal
from models.db_models import Run, Review

reviews_data = [
    """Can blinkit do this shit?
Ask India 
emoji:question:
i ordered condom from blinkit (it didnt come in discrete packing)

You might feel doubts i ask are weird and they might be but they are making my chest heavy (so please do help)

Q. Can anyone from their warehouse to my home complain my parents? Like galliyo ki aunty?

It was at bottom of some other snacks and i believe no one in my society saw that until and unless delivery guy made someone saw it… So can anyone from warehouse or delivery guy himself or society member (if anyone saw that but i doubt) Because they can get parents number from community app here

I might be overthinking but it is first time ordering something like this so please do help without judging ;(""",

    """HELP HELP HELP!! It's urgent and I'm panicking
I ordered ice Cream on blinkit. The order got delayed that's why I requested to cancel it. But before cancellation occured I recieved the order. After I ate it the order got cancelled and refunded. The delivery boy came back and demanded the product back. I explained him the situation he said his licence will get cancelled due to this. I explained this situation to blinkit customer care that it was my mistake and not the delivery guy's. Customer care said to give the refund amount to delivery guy and asked the delivery guy to submit it to the store. But delivery guy said that still his licence might get cancelled. My family is concerned that he'll come back if he's licence gets revoked. I'm very scared. Customer care said nothing will happen to delivery guy but didn't give email confirmation. They said supervisor team will contact me but that also hasn't happened yet. I'm very concerned. What can I do?
This has became a safety issue due to my mistake.
Also, I had raised a request to cancel the cancellation after receiving the ice Cream""",

    """Blinkit order that could've gone wrong
Discussion
Abhi blinkit ka bnda aaya Ghar aur meri behen ne order recieve Kiya bhai mast pi kar aaya tha which isn't that huge a problem what follows after is. He came with the order but there was an item missing. Toh instead of dealing with the person directly I contacted blinkit ka customer service and they promptly sent me a refund. Uske baad this person comes back chilaate hue, "Arrey aata aata" toh I went outside and he was there with the aforementioned packet of aata toh Maine le liya and he was like repeatedly asking ki "complaint toh nahi kiya" toh I said nahi Kiya because I was thinking ki as he is drink he might end up making a ruckus and blinkit aapas mei apna sort kar lenge.

But after 10 mins this person comes back screaming outside my house ki "vaapis karo vaapis karo". I was like le bhai le ja. And while going back vo bhai comment pass karte hue ja raha tha.

During this time I was just thinking ki for women living in Delhi on their own or even other households isn't it a little scary to order groceries or food at night ? I mean you never know who might end up coming to your house and getting your orders""",

    """Never order electronics or home appliances from blinkit

TLDR; Don't order electronics or household items from Blinkit, as if the product in not what is mentioned, they will not honor it and route you to brand service center after wasting your time.

Story:

I ordered Ailkin charger from Blinkit few times in the last 2 years. It is cheap and always worked flawlessly.

Last week I thought I would get one for the office as well. So I ordered it and noticed that it is not fast charging. Also the box doesn't say 100w SuperVooc, except a small sticker. I immediately contacted blinkit customer support to return the product, and they told me to troubleshoot for 40 minutes only to be told that they can't do anything and cannot return. What was the point of troubleshooting if they never intended to return it.

I asked for supervisor but they told that I will get a call back in 1-2 hrs, but I never did. I checked again after few hrs, next day twice but after 4 attempts, no callback. I gave them all the proof, showing slow charging and comparing with previous charger but they never responded for callback request.

Then I escalated to grievance team, but they told that they are just the seller and it could be a brand issue so I need to contact the brand and they are not liable.

At this point I already wasted over 4 hours in 2 days for a 800rs charger, and I knew it is not going anywhere. So I didn't followup and made a promise to never trust Blinkit for Electronics and Household items as they will not return it in case of issues.

They are good for groceries and basic stuff but don't trust them for costly items.

Anyways that's my rant wasting 10 more minutes but wanted to convey this message.""",

    """Pls check your Blinkit deliveries
Food


Pls don't trust Blinkit blindly.

Ordered grapes from Blinkit a couple of weeks back and the packet received felt suspiciously lighter. Weighed it to realise it was only 370 gms. I let it go thinking of it as a one off error.

To my surprise the same thing happened again yesterday. The half kg package of grapes weighed only 395gms (including the weight of packaging).

We've had similar issues in the past with respect to both quantity and quality of what was delivered. (Received open cat food boxes with a few pouches missing, cheaper fruits n vegetables instead of the ones ordered, overpriced products etc.) I feel this isn't by accident but a rather thought out way to scam customers.

Pls use blinkit only if absolutely necessary and double check everything to ensure you are not being scammed.""",

    """A Serious Wake-Up Call for Blinkit : Where Is the Accountability?
Rent/Let-out/Properties/Flatmate
This happened to a 19-year-old girl in Sohna, Haryana — a student, living alone for her education. She ordered something from Blinkit at 1 AM on August 6. The order arrived, all good. But as the delivery guy handed over the package, he said: "You’ll get another call — please pick up. It's just Blinkit confirming delivery. "That second call came within minutes. But it wasn’t Blinkit. It was the same delivery guy, asking her if she wanted to be friends. She was confused and clearly uncomfortable. She said no. He kept calling. Over and over. Asking “What’s the problem?”, “Just say yes.” She reached out to Blinkit immediately. They said they’d “investigate” and get back in 24 hours. The next morning, she gets a creepy silent call from Blinkit’s side — someone on the line but not speaking. Just long enough to count as a “callback.” Then they hang up. Later that day, she follows up. And their response?“ Yes, we looked into it. He called you by mistake. It won’t happen again. We’re closing this.”That’s it. No consequences. No accountability. That man is probably still delivering in the same area. Maybe knocking on another girl’s door tonight. And the company’s solution is… he won’t call again? Is that what women should settle for now — a promise he won't call again? This isn’t about one employee’s “mistake.” This is about a system that fails to protect women. A system that doesn't seem to care unless there’s a PR disaster. How many more incidents like this are brushed off quietly? As someone who’s always supported tech and startups, I’m genuinely disturbed. We celebrate speed and scale — but at what cost? Blinkit, you need to do better. Not just for her — for every woman using your app. To everyone reading this — please speak up. Not just when it happens to you or someone you know, but before it becomes “normal.” Because none of this should be normal.

Edit: Recently it made sense for how he was able to call after delivery. He didn't mark the order as delivered for 15mins.

Update 9pm, 8th August : Got an assurance that the guy has been removed from service. And at least won't be showing up at other doors. We have informed the society and society managers there to get his cctv footage so guards know it. Blinkit's part is done, that's all they could do. It's on us now to reach authorities if we see him again entering the society."""
]

db = SessionLocal()

# 1. Create a manual run
run_id = str(uuid.uuid4())
new_run = Run(
    id=run_id,
    status="complete",
    source_counts={
        "scraped": len(reviews_data),
        "analyzed": len(reviews_data),
        "discovery_related": len(reviews_data) # Treat as discovery related for our test
    }
)
db.add(new_run)

# 2. Insert the reviews
for r_text in reviews_data:
    new_review = Review(
        id=str(uuid.uuid4()),
        run_id=run_id,
        source="REDDIT",
        author="anonymous",
        content=r_text,
        is_discovery_related=True
    )
    db.add(new_review)

db.commit()
print(f"Successfully inserted {len(reviews_data)} Reddit reviews!")
print(f"Run ID: {run_id}")
db.close()
