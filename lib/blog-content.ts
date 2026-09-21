/**
 * Full article text for each blog/recipe post, migrated from the original
 * Kaasha by Vallari Shah Wix blog (kaashabyvallarishah.wixsite.com/mysite-1/post/<slug>).
 * Content is preserved to match the original meaning and facts — this is a real
 * nutritionist's published writing, not placeholder or invented copy.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string };

export const BLOG_CONTENT: Record<string, Block[]> = {
  "vegan-mushroom-stroganoff": [
    { type: "p", text: "Vegan mushroom stroganoff is one of the most hearty meals that you can have for either lunch or dinner. It is easy to make, and it's one of the most healthy, delicious meals that is vegan and gluten-free." },
    { type: "h3", text: "So what is stroganoff?" },
    { type: "p", text: "Stroganoff is a Russian dish which is actually just a creamy mushroom sauce, ideally served with egg noodles or fettuccine pasta. The traditional version has meat pieces in it, but I've tried to make this vegan version of the recipe with plant-based milk." },
    { type: "h3", text: "Recipe" },
    { type: "p", text: "Ingredients" },
    { type: "ul", items: [
      "1 onion, diced",
      "3 garlic cloves, minced",
      "1 tbsp. olive oil",
      "350 grams fresh mushrooms, sliced",
      "1 tbsp soy sauce",
      "3/4 cup vegetable broth or water",
      "3/4 cup coconut milk or cashew cream or almond milk",
      "2 tbsp cornstarch",
      "1 tsp onion powder",
      "1/2 tsp garlic powder",
      "1/2 tsp smoked paprika",
      "A pinch of red pepper flakes",
      "A pinch of dried oregano",
      "Salt & black pepper to taste",
      "1 tbsp nutritional yeast flakes (optional)",
      "Fresh parsley, chopped"
    ] },
    { type: "p", text: "Method" },
    { type: "ol", items: [
      "Heat oil in a large pan, add onion and fry for about 5 minutes. Add garlic and fry for a further 1 minute.",
      "Now add the mushrooms and fry over medium heat for about 5 minutes.",
      "Pour in vegetable broth/water, soy sauce, onion powder, garlic powder, red pepper flakes, dried oregano, salt and pepper. Add nutritional yeast flakes as well for the cheesy flavour. Bring to a boil.",
      "Add cornstarch to the coconut milk (this is my preference as I like the taste of coconut milk) and stir to dissolve.",
      "Pour the milk mixture into the pan and cook on low-medium heat for about 10 minutes until the sauce thickens.",
      "Taste and adjust seasonings to your preference."
    ] },
    { type: "p", text: "Add fresh parsley to taste! Enjoy with quinoa, rice, pasta of choice, or even mashed sweet potato." },
    { type: "quote", text: "Leave us a comment below if you tried it and loved it :)" }
  ],

  "why-it-makes-sence-to-eat-seasonal": [
    { type: "p", text: "We live in a modern age, where everything is easily available to us. We get pomegranates throughout the year, we eat avocado toast every day, we have frozen options for berries, and we eat carrots and beetroots even in summer." },
    { type: "p", text: "When it comes to our diet there are lots of facts and figures to consider — preservatives, pesticides, additives — and these are all things a modern-day consumer has to think about when choosing the food that will go into their body. It is a wise thing to choose and eat food which is seasonal, and as much as possible, local." },
    { type: "p", text: "In our ancient Indian practice of Ayurveda, this is called \"Ritucharya.\"" },
    { type: "h3", text: "Benefits of eating seasonal" },
    { type: "p", text: "It is better for you" },
    { type: "p", text: "Foods that are grown and consumed during the appropriate season are more nutritionally dense. When food is grown out of season, it isn't able to follow its natural growing and ripening process. For certain fruits and vegetables to be available year-round, post-harvest ripening agents are used — chemicals, gases and heat processes. Some produce is also coated with an edible film or wax to keep it fresh for longer. While this ensures farmers can meet year-round demand, researchers have found that artificially ripened produce is often not as nutritious as seasonal produce." },
    { type: "p", text: "It is more sustainable" },
    { type: "p", text: "Basing your diet around which vegetables and fruits are in season is a great strategy to support sustainability. Seasonal produce helps cut down on emissions associated with transportation and importing. Local farmers are also more likely to be practising sustainable agriculture methods." },
    { type: "p", text: "Think about it — how far did the avocado or kale that you bought from your local store travel before it was stocked at your grocery store? Did it come from a local farmer, did it drive across the country, or did it arrive by aeroplane? We give little or no thought to the effect of long-distance transport and the preservatives used to keep produce fresh." },
    { type: "p", text: "Nutritionally dense, with lots of variety in your diet" },
    { type: "p", text: "Plants provide us with many vital minerals, vitamins, antioxidants and more. Eating a wide variety of plant-based foods helps us get the various nutrients and nutritional abundance they provide. When you eat seasonally, you naturally rotate your food choices through the year, giving you plenty of variety in your diet." }
  ],

  "healthy-herbal-teas": [
    { type: "p", text: "Tea is a great way to wind down, to feel fresh, or even to feel alive for some people." },
    { type: "p", text: "If you follow me on social media or have consulted me, you might know I am not a fan of the \"fit-tea\" gimmick that acts like weight loss is some miracle. It is not a true claim — there is no magic or instant solution to weight loss." },
    { type: "p", text: "Don't get me wrong, I love teas, and modern science has begun to find evidence supporting some of the traditional uses of herbal teas as well. Herbal teas have been around in India for centuries." },
    { type: "p", text: "Below is a list of some delicious teas you can incorporate into your daily life:" },
    { type: "h3", text: "Chamomile Tea" },
    { type: "p", text: "Known for its calming properties. Studies have shown patients suffering from insomnia found marginal improvement in waking up during the night, time to fall asleep, and daytime functioning after consuming chamomile tea. Chamomile tea is even believed to have anti-bacterial and anti-inflammatory properties." },
    { type: "h3", text: "Ginger Tea" },
    { type: "p", text: "Ginger tea is definitely one of my favourites to add to my routine. It's a spicy and flavourful drink, but that's not all — it's packed with health benefits. Ginger tea helps fight inflammation and stimulates the immune system. It also relieves indigestion and constipation, and has shown results in easing and relieving period pain in females." },
    { type: "h3", text: "Hibiscus Tea" },
    { type: "p", text: "Hibiscus is a red/pink flower very commonly found in India. This flower, in the form of tea, has lots of healthful properties — hibiscus tea has anti-viral properties and has also been shown to have effects on high blood pressure." },
    { type: "h3", text: "Sage Tea" },
    { type: "p", text: "Sage tea is known for its medicinal properties. It helps improve mood, mental functioning and memory in adults. It is also said to improve blood lipid levels, though more research is ongoing in this area." },
    { type: "h3", text: "Bottom line" },
    { type: "p", text: "All you tea lovers — you can enjoy these herbal teas, which are free of sugar and calories but loaded with lots of health-promoting effects. If these reasons aren't enough to go and enjoy a cup of tea, I don't know what is! :)" }
  ],

  "is-cutting-down-completely-on-salt-sensible": [
    { type: "p", text: "Recently I've been hearing a lot of buzz around how salt is unhealthy. I even hear celebrities talking in interviews about cutting down on salt completely to prevent water retention and puffiness." },
    { type: "p", text: "But is it really healthy to cut down on salt completely? It's a great salt debate, I must say!" },
    { type: "p", text: "Salt is nothing but sodium chloride — 40% sodium and 60% chloride, both minerals that play an important role in the body. But salt gets a bad name because of the sodium in it. Sodium often gets lumped into the category of \"nutritionally no-no,\" but it's important to understand that sodium plays an important role in your body." },
    { type: "p", text: "Sodium is required for many important functions in your body, like maintaining nerve function — it helps send messages/signals to and from the brain. Sodium also helps keep your heartbeat steady, and helps hold water in your body so you stay hydrated." },
    { type: "p", text: "Most importantly, sodium helps you maintain your blood pressure. Omitting or minimising sodium/salt completely from your diet can lead to low blood pressure, which in extreme cases can be dangerous. Salt is also an excellent source of electrolytes, which has been shown to prevent muscle cramping during exercise." },
    { type: "p", text: "Excess salt intake can be harmful for people with high BP, so people with hypertension should have salt in controlled proportion as advised by their doctor and nutritionist." },
    { type: "ul", items: [
      "RDA suggests: 2000 mg/day for age under 50 years",
      "1500 mg/day for age above 50 years"
    ] },
    { type: "p", text: "What type of sodium intake is unhealthy? The sodium you take in from salt-overloaded processed foods — it's even difficult to track how much salt you're actually consuming from these." },
    { type: "h3", text: "Bottom line" },
    { type: "p", text: "Salt is an important part of our daily diet and it serves essential roles in our body. So don't blindly cut it down unless it's advised by your doctor. Don't be afraid of consuming salt — just be mindful of the amount you're consuming." }
  ],

  "lets-get-all-cheesy": [
    { type: "p", text: "We all want to have cheese, but unfortunately it has some bad reputation floating around — like cheese makes you fat, or it's categorised as one of the unhealthy foods to eat because it's high in calories and sodium." },
    { type: "p", text: "But seriously, is there anything \"grater\" than cheese?" },
    { type: "p", text: "Cheese is often maligned as being higher in saturated fats and sodium than other snacks, but the right type of cheese can be delicious, filling and nutritious. It's an excellent source of protein, calcium and other nutrients. Adding the correct portion size of the right type of cheese to your snack or salad can make it satisfying, delicious and nutrition-dense." },
    { type: "h3", text: "1. Mozzarella Cheese" },
    { type: "p", text: "Mozzarella cheese is very high in moisture and low in sodium compared to other cheeses. Mozzarella contains bacteria that act as a probiotic, improving gut health, immunity and inflammation in the body." },
    { type: "p", text: "Add it to: your caprese sandwich or caprese salad, or grate some onto your margherita pizza." },
    { type: "h3", text: "2. Feta Cheese" },
    { type: "p", text: "Feta is typically made from goat or sheep milk. It's high in sodium but lower in calories compared to other cheeses. Feta cheese contains CLA (conjugated linoleic acid), which helps reduce body fat and improve body composition." },
    { type: "p", text: "Add it to: your watermelon feta salad, or crumble some feta over grilled vegetables, or have 2–3 cubes of the cheese with a cracker." },
    { type: "h3", text: "3. Cottage Cheese / Paneer" },
    { type: "p", text: "Cottage cheese or paneer is the most common cheese used in India. It's high in protein and very high in selenium, a key antioxidant that helps reduce the risk of chronic inflammation." },
    { type: "p", text: "Add it to: your spinach gravy or tomato-based gravy. Grate the paneer and make a paneer bhurji, add some cubes to your pizza or salad, or grill it to make paneer tikka." },
    { type: "h3", text: "4. Goat Cheese" },
    { type: "p", text: "Goat cheese is naturally lower in lactose and casein, which makes it easier to digest than cheese made from cow's milk. It also has more MCTs, so it's rapidly absorbed in the body and less likely to be stored." },
    { type: "p", text: "Add it to: crumble goat cheese over your pizza, or make a whipped goat cheese spread with herbs for lavash, crackers, or a few carrot/cucumber sticks." },
    { type: "h3", text: "5. Parmesan Cheese" },
    { type: "p", text: "Parmesan cheese is made from raw, unpasteurised cow's milk, aged for at least 12 months to kill harmful bacteria. This cheese is packed with nutrients — especially calcium and phosphorus, both important for bone health. One serving of parmesan has about 9 grams of protein and tends to be lower in fat. It's true that parmesan tends to be high in sodium, but the beauty of this cheese is that a little goes a long way." },
    { type: "p", text: "Add it to: grate parmesan flakes over your pasta and pizza, sprinkle on your salad, or spread parmesan slices on a cheese board with fruits and nuts." },
    { type: "h3", text: "6. Ricotta Cheese" },
    { type: "p", text: "This Italian cheese is made from the whey of cow, goat or sheep milk left over from making other cheeses. The protein content in ricotta cheese is around 12 grams per 1/2 cup — mostly whey, which is easily absorbed and also helps with muscle building and growth." },
    { type: "p", text: "Add it to: a grilled ricotta spinach sandwich, or use it as a ravioli filling with butternut squash. Add ricotta to your eggplant or zucchini lasagna to make it taste even more delicious." },
    { type: "p", text: "While you're shying away from your favourite food — cheese — nutrition experts will agree that not all cheese is bad for you. It may be smart to use a low-fat version of cheese for everyday meals. Enjoy your cheese without feeling guilty, just keep an eye on portion size. Moderation is the key!" },
    { type: "quote", text: "What's your favourite type of cheese that you enjoy the most? Let me know in the comments below :)" }
  ],

  "why-diet-is-important-for-hair-growth": [
    { type: "p", text: "Diet plays an important role in keeping the skin and hair healthy. The foods people eat have an impact on the growth, strength, and volume of their hair." },
    { type: "p", text: "We lose a certain amount of hair every day, which is normal — but when you're losing a chunk of hair, that's not normal. Many factors influence your hair and skin, like genetics, age, hormones and nutrition deficiency. Hair does need nutrition to look healthy and grow well. While we can't control the other factors, a balanced diet can definitely improve your hair growth." },
    { type: "p", text: "The most common reasons you may experience hair loss:" },
    { type: "h3", text: "Not having enough calories" },
    { type: "p", text: "There are men and women who go on extreme calorie-deficit diets, which can end up leading to hair loss. Remember that your skin, hair and nails can be treated as accessory compared to vital organs like the heart or brain. If you're not consuming enough calories to carry out important functions, there's little room for extra energy to nourish your hair and skin." },
    { type: "h3", text: "Not including enough protein in your diet" },
    { type: "p", text: "Your hair is composed primarily of protein, so including an adequate amount in your diet is vital for hair growth. I suggest including foods like quinoa, tofu, cottage cheese, legumes and nuts daily in your diet for better hair growth." },
    { type: "h3", text: "Inadequate iron intake" },
    { type: "p", text: "Iron isn't just for helping our red blood cells carry oxygen to cells — it plays a vital role in hair growth. Try incorporating dates, pomegranate, spinach and similar foods into your diet, or include an iron supplement." },
    { type: "h3", text: "B-vitamin deficiency" },
    { type: "p", text: "All the B-vitamins play an essential role in hair health, especially biotin. B-vitamins play an important role in carrying oxygen to cells, including the cells of the scalp. Vegans and vegetarians are mostly deficient in vitamin B-12 and should include a B12 supplement to meet nutritional needs." },
    { type: "h3", text: "Vitamin C" },
    { type: "p", text: "Vitamin C is essential for hair growth as it helps with effective iron absorption. It also helps promote collagen production, which strengthens hair strands. Include oranges, bell peppers, sweet limes, lemon and berries in your diet — vitamin C is a strong antioxidant that protects hair strands from oxidative stress." },
    { type: "h3", text: "Zinc" },
    { type: "p", text: "Zinc plays an important role in hair tissue growth and repair. It also helps keep the oil glands around the follicles working properly." },
    { type: "h3", text: "Vitamin E" },
    { type: "p", text: "Like vitamin C, vitamin E is an antioxidant that helps combat oxidative stress by neutralising free radicals. It protects areas of the skin, like the scalp, from oxidative stress and damage. Damaged skin on the scalp can result in poor hair quality and fewer hair follicles. Avocados, sunflower seeds, spinach and almonds are amazing sources of vitamin E to include in your diet." },
    { type: "p", text: "Bottom line: what you eat can have a huge effect on the health of your hair. Fortunately, correcting a deficiency in any of these nutrients may help treat hair loss and promote the rate of hair growth." },
    { type: "quote", text: "Let us know if you're experiencing hair loss or a hair growth problem and we'll help you correct it :)" }
  ],

  "foods-you-think-are-healthy-but-really-are-not": [
    { type: "p", text: "As we all struggle to eat healthy, we try to pick up the best healthy food options we see in the aisles of the grocery store." },
    { type: "p", text: "But what we forget — which is actually the most important thing to do while buying things — is to read the labels! Just because food products have \"organic,\" \"low-fat,\" \"all natural,\" \"herbal,\" or \"real fruit\" written on them, it doesn't mean they get nutritionist approval." },
    { type: "p", text: "There's no such thing as strictly \"good\" or \"bad\" food, but long-term inclusion of certain foods containing lots of added sugar, sodium or oil can lead to unintentional health conditions like diabetes, high cholesterol, hypertension, PCOS and more." },
    { type: "p", text: "To improve your long-term health, check out the list below and the easy swap alternatives you can make at home." },
    { type: "h3", text: "Flavoured Yogurt" },
    { type: "p", text: "When you're out for something sweet, yogurt bars may seem the healthiest choice among ice-creams, donuts or pastries. But what people don't see are all the hidden ingredients — most flavoured yogurts contain lots of sugar, artificial flavouring/syrups, or sweetened fruit. It's no wonder they cause a spike in blood glucose, leading to a sugar crash and a grumbling stomach an hour later." },
    { type: "p", text: "Swap it: choose an unsweetened full-fat Greek yogurt, or a coconut/almond home-made yogurt. Top with berries and a sprinkle of crunchy pumpkin seeds — this tastes delicious and will keep you full for hours." },
    { type: "h3", text: "Granola Bars" },
    { type: "p", text: "On the surface, many granola bars and energy bars look like a healthy option — chunks of dried fruit, oats, nuts, even dark chocolate. It looks like a packet full of goodness. But flip the label and check the ingredient list, and it often contains high fructose corn syrup and hydrogenated oil." },
    { type: "p", text: "Swap it: make home-made energy ladoos with dates, oats, nuts, seeds and coconut oil for a good on-the-go or mid-meal snack." },
    { type: "h3", text: "Baked Vegetable Chips" },
    { type: "p", text: "We all love chips! Fried potato chips are everyone's favourite but extremely high in calories, so it becomes very easy to reach for baked vegetable chips instead. Unfortunately, you're not always getting much actual sweet potato, beetroot or squash in these chips — most brands use veggie powder for colour, and even \"baked\" versions use a lot of oil to get crispy, plus heavy salting." },
    { type: "p", text: "Swap it: make and bake vegetable chips at home. Slice the vegetables, drizzle with olive oil, sprinkle with herbs, and bake until brown and crisp." },
    { type: "h3", text: "Nut Butter" },
    { type: "p", text: "Don't get me wrong — nut butter is healthy, but not the nut butter generally found in commercial stores. It's very important to check the label. If your nut butter's label says nuts + sugar + hydrogenated oil, that's why you can't stop at just one tablespoon." },
    { type: "p", text: "Swap it: you don't actually need to swap nut butter — just look for one that has only nuts (almonds/peanuts/cashews etc.) and nothing else. Nut butters are also very easy to make at home." },
    { type: "h3", text: "Low-fat Salad Dressing" },
    { type: "p", text: "\"Low-fat\" is a term people relate to \"healthy,\" but low-fat isn't always the healthiest option. As soon as a product is made low-fat, it's often replaced with added sugar, salt and high fructose corn syrup — ending up very high in empty calories and nowhere near healthy. It's also important to understand that fats aren't bad for us — we need them to absorb and synthesise all fat-soluble vitamins." },
    { type: "p", text: "Swap it: salad dressings are easy to make at home with fresh herbs, spices, apple cider vinegar, olive oil, soy sauce, chilli and lemon juice — an amazing replacement for commercial bottled dressings." },
    { type: "quote", text: "Do you have other healthy swaps for these not-so-healthy foods? Let us know in the comments below :)" }
  ],

  "meditation-and-nutrition": [
    { type: "p", text: "In today's hustle and bustle of daily life, meditation is vital, regardless of whether you are a spiritual person or not." },
    { type: "p", text: "Fun fact: meditation has been an integral part of many religions and was first spoken of in written form in 1500 BC in India." },
    { type: "p", text: "Your body thrives on a state of balance. It relies on complete nutrition to function at an optimal level — if it's dealing with any nutrition deficiency, it can be much harder to gain mental clarity and reach that zen state. It's important to have a healthy diet and to fuel your body for more mindful meditation." },
    { type: "h3", text: "1. Boost your body with healthy fats" },
    { type: "p", text: "The human brain is mostly made up of fat and relies on getting enough of the right fats to run effectively. Boosting your intake of healthy fats gives the brain what it needs to perform at a higher level. The fats required by the brain include saturated, monounsaturated, cholesterol, omega-3 and omega-6 — and some of the healthiest, tastiest foods are full of good fats. Try adding a variety of healthy fat foods to your diet, such as avocados, tahini, pumpkin seeds, coconut oil, organic ghee and walnuts." },
    { type: "h3", text: "2. Incorporate fermented food into your diet" },
    { type: "p", text: "In nutrition, we understand that the gut and the brain are intrinsically connected — the gut microbiome is finally starting to receive the attention it deserves for its effects on the brain and mental health. When the bad bacteria in your gut outnumber the good, your digestion can become compromised, leading to poor absorption. When you're not absorbing your nutrients, your mind is at a loss for the nutrition it needs to be optimally fired up." },
    { type: "p", text: "The good news is you can replenish the good bacteria in your gut by eating more fermented foods. Start simple and try adding some of these to your diet: sauerkraut, kimchi, kombucha, kefir and miso." },
    { type: "h3", text: "3. Eliminate sugar from your diet" },
    { type: "p", text: "Too much sugar can be totally draining — both physically and mentally. We often equate sweets with love, adding an extra emotional layer to our eating habits. In excess, sugar can lead to mental fatigue, nervousness, hyperactivity, anxiety and low mood — all more reason to reduce how much sugar you take in." },
    { type: "p", text: "It's best to eliminate refined sugars, such as white sugar, brown sugar and corn syrup. Instead, focus on small amounts of natural sugars like raw honey, stevia or maple syrup." },
    { type: "p", text: "Tips for getting off sugar:" },
    { type: "ul", items: [
      "Drink plenty of green vegetable smoothies and juices to help keep the body mineralised and energised.",
      "Add fruit to your diet to curb sugar cravings.",
      "Keep yourself hydrated.",
      "Have healthy fats in the first half of your day, like chia seeds, almonds or ghee."
    ] },
    { type: "p", text: "Meditation is something everyone can do to improve their mental and emotional health. You can do it anywhere, without special equipment or memberships. Trying a style of meditation suited to your goals is a great way to improve your quality of life, even if you only have a few minutes to do it each day — and eating the right kind of nutritious food will help you optimise your results." }
  ],

  "quarantine-food-and-healthy-you": [
    { type: "p", text: "We are all going through this pressure of COVID-19, and now that we've surpassed a month, we're getting very much used to it. As it's said, it takes 21 days to make or break a habit." },
    { type: "p", text: "As we all lie around in our lounge wear all day — reading, chilling, watching shows on Netflix — we keep munching on all the food we've stocked at home. We're taking this quarantine period more like a summer vacation, and our eating is no longer dependent on physical hunger but on our \"mental hunger,\" where we end up having more in between our 3 major meals." },
    { type: "p", text: "Snacking can be tricky, but it can actually help you keep your weight and fitness on track." },
    { type: "h3", text: "1. Baked sweet potatoes with Greek yogurt & walnuts" },
    { type: "p", text: "Microwave a small or medium sweet potato for 3–5 minutes, until tender and soft. Once cooked, split it open and add 2 tbsp. of Greek yogurt and 1 tbsp. chopped walnuts." },
    { type: "h3", text: "2. Cucumber sticks and almond/peanut butter" },
    { type: "p", text: "So simple yet so delicious! Cooling, fibrous cucumber with yummy, healthy peanut butter keeps you full and energised for a long time. Portion size: 1 to 1.5 cucumbers, sliced, + 2 tbsp. unsweetened almond/peanut butter." },
    { type: "h3", text: "3. Makhanas" },
    { type: "p", text: "Makhana are a handy, light and easy-to-store snack. Have them between meals, or they work perfectly as a mid-night snack. You can either roast them in masala (red chilli, turmeric and a little salt) or have them plain." },
    { type: "h3", text: "4. Grilled paneer/tofu with pesto sauce" },
    { type: "p", text: "Grill 4–5 sticks of paneer or tofu cubes (15 grams each) and add home-made pesto sauce for an easy, yummy snack." },
    { type: "p", text: "Home-made pesto:" },
    { type: "ul", items: [
      "1 cup spinach",
      "1–2 tbsp. basil",
      "5 walnuts / 7–8 almonds",
      "1 tsp. lime juice",
      "1–2 tbsp. olive oil",
      "Salt and pepper to taste"
    ] },
    { type: "h3", text: "5. Fruit + Nuts" },
    { type: "p", text: "A very easy, lazy man's healthy snack — an apple with a few almonds, or 2–3 slices of papaya with a few walnuts, or 2 oranges with a few pistachios. They're loaded with fibrous carbs, good fat and protein." },
    { type: "h3", text: "6. Sprouts chaat" },
    { type: "p", text: "Yummy, healthy and so filling! Take around 3–4 tbsp. of sprouts, add veggies like onion, tomatoes, cucumber, bell peppers and green chilli, and top with a little lime juice." },
    { type: "h3", text: "7. Unsalted popcorn with nuts" },
    { type: "p", text: "Late-night binge-watching generally makes us crave our classic — popcorn. Have a handful of unsalted, unflavoured popcorn with a few nuts (5–6 almonds, 5 walnuts, or 10–12 pistachios) to satisfy both physical and mental hunger." },
    { type: "h3", text: "Bottom line" },
    { type: "p", text: "When you crave your next snack, aim for whole food rather than highly processed, fattening snacks. Have a healthy combination of carbs, protein and good fat to keep you full for longer, keeping your taste buds in mind :)" },
    { type: "quote", text: "Do let us know in the comments if you have more healthy options to add to this list!" }
  ],

  "food-for-happy-hormones": [
    { type: "p", text: "The lockdown and quarantine has made us so dreamy! Most of us are thinking of all the happy holidays as our travel plans for this year get postponed, while some of us are dealing with anxiety listening to COVID-19 news around our nation and the world." },
    { type: "p", text: "Mental and physical health is a struggle right now, and it's very important to maintain our immunity to stay healthy and fit during such situations. While our immunity can be affected by anxiety and mental tension — which cause a rise in stress hormones — it's very important to ease them with our \"happy hormones.\"" },
    { type: "p", text: "Yes, you read that right! Serotonin and endorphins are called happy hormones for a reason." },
    { type: "p", text: "Endorphins are your body's natural pain reliever, produced in response to stress or discomfort. Endorphin levels also tend to increase when you engage in reward-producing activities, such as eating or working out." },
    { type: "p", text: "Serotonin helps regulate your mood, so it's crucial for people dealing with anxiety and low mood, as well as sleep, appetite, digestion, learning ability and memory." },
    { type: "h3", text: "Foods that improve your mood" },
    { type: "h3", text: "1. Pumpkin seeds" },
    { type: "p", text: "Pumpkin seeds are one of the best food sources of an amino acid known as tryptophan, which helps the production of serotonin in your brain." },
    { type: "p", text: "Eat this: a teaspoon or two of pumpkin seeds makes a fine small mid-day snack, or add them as a topping to soup or salad for extra crunch." },
    { type: "h3", text: "2. Spinach or Kale" },
    { type: "p", text: "Spinach contains magnesium, which makes you feel more energetic during low moods. It helps increase phenylethylamine, which is found in most anti-depressants and leads to increased serotonin levels. It's a healthy green vegetable, rich in iron." },
    { type: "p", text: "Eat this: make a simple spinach soup to boost mood and immunity, or a baby spinach wrap with tamarind chutney, peanuts, chillies and grated carrots and onions." },
    { type: "h3", text: "3. Coconut" },
    { type: "p", text: "Coconut is chock-full of medium-chain triglycerides, fats that keep your brain healthy and fuel better moods." },
    { type: "p", text: "Eat this: add shredded coconut to your breakfast oats, or have 2–3 pieces of coconut chunks, or make a delicious pesto coconut curry with lots of veggies — it will lift your mood instantly :)" },
    { type: "h3", text: "4. Avocado" },
    { type: "p", text: "Avocados contain vitamin B3, known for its serotonin-boosting factors. They're also rich in omega-3 fatty acids, highly nutritious, loaded with fibre, and contain potassium, which helps regulate blood pressure and lower bad cholesterol." },
    { type: "p", text: "Eat this: have avocado toast for breakfast, or an avocado salad with cherry tomatoes and cottage cheese for lunch or dinner — healthy, filling and perfect for lifting your mood." },
    { type: "h3", text: "5. Curd" },
    { type: "p", text: "Curd is a popular probiotic in Indian households — an excellent mood-changer as it contains tryptophan. Serotonin is produced from tryptophan, but tryptophan alone can't cross the blood-brain barrier to make us happy on its own." },
    { type: "p", text: "Eat this: curd and berries make an amazing combination for a tasty dessert and mood lifter. Curd rice — soothing and easy to digest — is great for lunch." },
    { type: "p", text: "This quarantine can definitely be a difficult period to deal with, but meditate, work out and eat healthy to maintain good immunity. Try to spend a few minutes in sunlight every day, which helps your brain produce serotonin." },
    { type: "p", text: "Relax, stay fit and stay safe." }
  ],

  "herbs-and-garlic-amaranth-crackers": [
    { type: "p", text: "Most of the new diets and trends have put wheat in a bad name and shame. But our tea-times are always incomplete without our cookies and crackers. Here's a recipe which is gluten-free, vegan and wholesome too." },
    { type: "p", text: "Amaranth flour is gluten-free and vegan, and it's rich in good quality protein because of its rich content of the amino acids lysine and methionine." },
    { type: "p", text: "Herb and Garlic Amaranth Crackers are really simple to throw together — the resulting dough is beautifully soft and easy to handle, and when rolled between two sheets of baking paper, doesn't even need flour for rolling." },
    { type: "h3", text: "Recipe" },
    { type: "p", text: "Ingredients" },
    { type: "ul", items: [
      "1 cup amaranth flour",
      "3 tbsp olive oil",
      "3 tbsp water",
      "1/2 tsp baking powder",
      "1 fat clove of garlic, grated",
      "6 sprigs of thyme, leaves picked",
      "1 tbsp fresh rosemary leaves, finely chopped",
      "1/2 tsp salt"
    ] },
    { type: "p", text: "Method" },
    { type: "ol", items: [
      "Preheat the oven to 180°C (355°F).",
      "Knead all the ingredients together until smooth.",
      "If the dough is sticky, add a little more flour and knead until it's soft and consistent.",
      "Flatten the dough and roll it out using a rolling pin to a thickness of 5mm (1/5 of an inch).",
      "Use a 5cm (2 inch) diameter cookie cutter to cut out the crackers, and place them on a baking tray lined with baking paper.",
      "Gently prick all over the crackers with a fork to prevent them puffing up while baking, and bake for 12 to 15 minutes, or until golden around the edges.",
      "Place on a cooling rack to cool completely before placing in an airtight container, if not serving immediately."
    ] },
    { type: "p", text: "Accompany these crackers with a cup of green tea or coffee. You can make a home-made cashew cheese dip and add it as a topping, making it an amazing appetizer for a party — or have it with peanut/almond butter as your mid-day snack." },
    { type: "quote", text: "Can't wait to see you all enjoy this recipe! Leave us a comment below if you tried it and loved it :)" }
  ],

  "is-the-sugar-in-fruit-bad-for-me": [
    { type: "p", text: "There was a time when we didn't question whether fruit was good for us, when we more or less took \"eat your fruits and veggies\" to heart. Today, many people are worried fruit is high in sugar, carbs and calories." },
    { type: "p", text: "There's so much information available on the internet, and people follow diets promoted by celebrities without understanding what's actually good for them and their body. Being a nutritionist, it's a struggle for us to help patients understand what's actually good for them." },
    { type: "p", text: "One of my patients wouldn't eat any fruit other than blueberries because she'd heard and read the myth, promoted by fad diets, that blueberries are the only \"safe\" fruit to eat because they're \"low glycemic,\" i.e. they don't spike blood sugar levels." },
    { type: "p", text: "A lot of new diet trends like keto, pegan and others eliminate the fruit group completely; in fact, they even call fruit \"toxic\" because of its sugar content." },
    { type: "h3", text: "So is the sugar in fruit really bad for you?" },
    { type: "p", text: "The truth is, there's a huge difference between added sugar — like white sugar, or even more \"natural\" sugars like jaggery, coconut sugar or honey — and the sugar found in fruit. Added sugars don't come with additional nutrients (although a case could be made for some, like honey or jaggery, but you'd have to consume a very large quantity of them to get the trace amount of nutrients)." },
    { type: "p", text: "When you eat an apple, a papaya, a peach or some berries, their sugar comes wrapped in a fibre-rich, water-rich, nutrient-rich package. That fibre slows the release of the fruit's natural sugar into your bloodstream, preventing a sugar spike, especially if you eat your fruit as part of a meal or snack that contains protein and healthy fats." },
    { type: "p", text: "The fibre in fruit also contributes to feelings of fullness and better digestion, and it helps feed the good bacteria in your gut." },
    { type: "p", text: "Of course, \"eat your fruit\" means eat a whole fruit, not fruit juice — so you can take care of the sugar intake. Fruit juice even lacks the fibre content, which makes it high GI, i.e. it spikes your blood sugar." },
    { type: "p", text: "On the topic of diabetes: diabetes doesn't mean you have to exclude fruit from your diet. It means you have to eat a reasonable portion (one standard serving) at a time and not overdo it. It's also wise to pair your fruit with protein or healthy fat — like fruit with a few nuts, or Greek yogurt with fruit — to slow the absorption of glucose into your blood. But you still don't have to cut out fruit, contrary to popular belief." },
    { type: "p", text: "Fruit also contains tons of vitamins and minerals, especially vitamins A and C, potassium and magnesium. Finally, fruit is one of the best sources of disease-fighting phytonutrients — different colours of fruit represent different phytonutrients, many with cancer-fighting antioxidant or inflammation-lowering properties. Eating fruit is associated with a lower risk of cancer, heart disease and memory problems." },
    { type: "quote", text: "Bottom line: an apple a day keeps the doctor away! Fruit is nutritious, so don't eliminate it from your diet — you can limit your serving size. The sugar in fruit is definitely not the same as extra added sugars." }
  ],

  "healthy-office-snacks-to-keep-you-energised": [
    { type: "p", text: "Scrolling through my Instagram stories the other day, I saw a friend munching on sweets during her office hours — speaking to her, I realised how difficult it is for people to maintain a healthy snacking routine at work." },
    { type: "p", text: "It definitely requires planning, but having healthy snacks on hand at the office is key for staying fuelled and focused when you need it most. Say \"no\" to croissants and donuts at work — a solid snack should have some protein and fibre to keep you satisfied until your next meal." },
    { type: "p", text: "Here are a few healthy snack options you can keep right at your desk that will keep you energised:" },
    { type: "h3", text: "1. Granola" },
    { type: "p", text: "A low-sugar granola is a great dry snack to keep at your desk, because you can eat it plain or add it to different meals through the day — with milk from the office fridge, over a portion of Greek yogurt for extra protein, or added to salad for crunch." },
    { type: "h3", text: "2. Apple + Nut Butter" },
    { type: "p", text: "Instead of reaching for a candy bar or cookie, try apples with peanut or almond butter — you'll get protein, fibre, minerals and vitamins in a small package. Try to pick a nut butter without added sugar; trust me, you won't need it." },
    { type: "h3", text: "3. Roasted Chickpeas" },
    { type: "p", text: "Roasted chickpeas are easy to carry around and have a good shelf life to store at work. A handful is power-packed with fibre, carbohydrates and protein — a good portion will keep you full for a long time without pinching your pocket." },
    { type: "h3", text: "4. Seeds and Nuts" },
    { type: "p", text: "Seeds and nuts are a source of protein and good fat, and are easy to store, quick, and not messy. They're great by themselves and even better on top of salad, yogurt, or oatmeal. Favourites include pumpkin seeds, sunflower seeds, almonds and walnuts — but everything from pistachio to chia, hemp and pecans are great for snacking." },
    { type: "h3", text: "5. Hummus and Carrots" },
    { type: "p", text: "Hummus is a delicious dip made from chickpeas, tahini, garlic, olive oil and lemon juice that goes great with carrots or zucchini. Hummus contains fibre, protein and healthy fats, while carrots are loaded with beta carotene, a precursor for vitamin A." },
    { type: "h3", text: "6. Home-made Energy Balls" },
    { type: "p", text: "Energy balls are typically made from oats, nut butter, a sweetener, and other add-ins like dried fruit. Depending on the ingredients, they're high in fibre, healthy fats, protein and several vitamins and minerals." },
    { type: "p", text: "Recipe: combine 1 cup (80 grams) of rolled oats with 1/2 cup (128 grams) of peanut/almond butter, 2 tablespoons (14 grams) of ground flax seeds, and 2–3 chopped dates. Roll spoonfuls into bite-sized balls and enjoy as a treat throughout your workday." },
    { type: "h3", text: "7. Rice Cakes" },
    { type: "p", text: "Rice cakes may be famously flavourless on their own, but they're the perfect vessel to top with almost any kind of spread — a bit of nut butter for something sweet, or guacamole or hummus for a quick, savoury treat." },
    { type: "h3", text: "Bottom line" },
    { type: "p", text: "Having healthy snacks on hand at work is a great way to stay energised, focused and productive. The snacks in this list are easy to make, nutritious, and can be stored at your desk. With such tasty options, you can easily stick to a healthy diet at home, at work, and on the go." }
  ],

  "fitness-food-on-any-budget": [
    { type: "p", text: "Being in the position of wanting to eat well and make progress in the gym, but thinking it's too expensive and you can't afford it — you can still eat quality food and easily get enough nutrition without breaking the bank." },
    { type: "quote", text: "Eating for muscle gain doesn't have to be expensive. Just keep your grocery list simple, and stock up on the good stuff." },
    { type: "p", text: "Below are a few things to keep in mind:" },
    { type: "h3", text: "1. Fruits & Vegetables" },
    { type: "p", text: "Buy in season. Although most fresh fruit and vegetables are available year-round, some are less expensive when in season. Also keep in mind that all forms of fruit and vegetables are nutritious, so frozen or canned are okay too." },
    { type: "h3", text: "2. Do not shop when you are hungry" },
    { type: "p", text: "You may be tempted to buy things that aren't even on your list, or that you don't need." },
    { type: "h3", text: "3. Make your own nut butter & nut milk" },
    { type: "p", text: "It's no secret that nut butters and nut milks are hella expensive, especially if you go through them as fast as we do. Save some cash by making your own at home — this way you know they're organic and cost-saving too." },
    { type: "h3", text: "4. Buy Local" },
    { type: "p", text: "Consider buying fruit and vegetables from local markets. When you buy local, in-season foods are generally cheaper and travel costs are minimised. If you find a really great deal, buy extra and freeze it." },
    { type: "h3", text: "5. Stay Organised" },
    { type: "p", text: "When your fridge, freezer and pantry are well organised, you're less likely to buy products you don't need. Make a list to keep track of what's in stock." },
    { type: "h3", text: "6. Protein Shakes" },
    { type: "p", text: "Pre-workout meals/shakes and protein powders are generally the most expensive part of a fitness journey if you include them. But there are inexpensive options — like banana, dates, or beetroot juice — depending on your goal and daily diet. Home-made protein shakes are organic, safe, and can be just as healthy as synthetic protein shakes/bars." },
    { type: "p", text: "An example home-made protein shake recipe:" },
    { type: "h3", text: "Berry Berry Shake" },
    { type: "p", text: "Ingredients" },
    { type: "ul", items: [
      "2/3 cup Greek yogurt",
      "2/3 cup fresh/frozen berries",
      "2/3 cup unsweetened almond milk",
      "1/4 cup almonds, divided",
      "1 tsp. honey (optional)",
      "2 tbsp chia seeds"
    ] },
    { type: "p", text: "Method: in a blender, add all of the ingredients, reserving a few almonds. Blend until smooth and all ingredients are incorporated. Chop the reserved almonds to stir in if desired. Pour and enjoy." }
  ],

  "cold-and-cough-remedies-right-from-your-kitchen": [
    { type: "p", text: "The common cold can be a precursor to flu and other health problems. It attacks the respiratory system, impacting the nose, lungs and throat." },
    { type: "p", text: "Here are some easy-to-try remedies right from your kitchen that can help you get rid of a cold and cough:" },
    { type: "h3", text: "1. Vitamin C" },
    { type: "p", text: "Vitamin C plays an important role in your body and has many health benefits." },
    { type: "p", text: "Tip: squeeze half a lemon into hot green tea — it will help reduce phlegm when you're feeling unwell." },
    { type: "h3", text: "2. Raw Ginger" },
    { type: "p", text: "Raw ginger wards off the feeling of nausea that often accompanies influenza." },
    { type: "p", text: "Tip: add grated ginger to water and boil for a few minutes. Once done, add honey and turmeric and drink to relieve cough and cold." },
    { type: "h3", text: "3. Steam" },
    { type: "p", text: "You can loosen a stuffy nose if you breathe in some steam. Steam gives instant relief from a cold and paves the way for easier breathing." },
    { type: "h3", text: "4. Raw Garlic" },
    { type: "p", text: "Raw garlic is a strong anti-viral, anti-bacterial, anti-parasitic and anti-fungal that gives the immune system a boost." },
    { type: "p", text: "Tip: mince a few cloves of garlic, mix with olive oil, salt, pepper and a few fresh herbs, and spread it on your food." },
    { type: "h3", text: "5. Turmeric" },
    { type: "p", text: "Turmeric has antioxidant, antibacterial and anti-inflammatory benefits that help prevent and tackle a number of issues." },
    { type: "p", text: "Tip: warm a cup of milk, add 1 tsp honey and 1/2 tsp turmeric, and drink at night — it will boost your immunity and give you a good night's sleep." },
    { type: "quote", text: "Do you have a home remedy for the common cold? Share it in the comments below!" }
  ],

  "ways-to-fuel-for-early-morning-work-out": [
    { type: "p", text: "When you jump out of bed at your 5:30 a.m. alarm, eating breakfast might be the last thing on your mind. But after fasting all night, your energy stores are depleted — and the last thing you want to hear during your workout is your stomach growling." },
    { type: "p", text: "The size of your pre-workout meal will vary depending on the length and intensity of your workout. Going for a long or high-intensity workout? Consider a more energy-dense meal, but keep in mind it may take 3–4 hours to fully digest. A lower-intensity workout requires less energy — aim for a small meal that can be digested in about 2–3 hours. But if you're working out early in the morning, you won't have 2 hours to spare." },
    { type: "p", text: "Just can't eat breakfast early in the morning? While you may be used to running on fumes, your performance may be suffering. Luckily, your gut can be trained to accept a light morning meal — a little change in eating habits can make a huge difference in your performance." },
    { type: "p", text: "If you're ready to accelerate your a.m. fuel, check out what to eat before a morning workout:" },
    { type: "h3", text: "1. Fruit + nut butter" },
    { type: "p", text: "Fruit — fresh, frozen or dried — has quickly digestible carbohydrates that can fuel a morning workout, and offers a light option if you're not an early-morning eater. Pair it pre-workout with a tablespoon of nut butter for a combination of carbohydrate, protein and fat." },
    { type: "h3", text: "2. Oatmeal" },
    { type: "p", text: "A very easy, go-to option — you can't go wrong with a classic bowl of warm or cold oatmeal. Packed with carbohydrates and fibre, oats give sustained energy throughout your morning workout, with endless mix-in options like nuts, nut butter, dried fruit, yogurt or protein powder." },
    { type: "h3", text: "3. Avocado toast" },
    { type: "p", text: "Avocados in the morning? Yes! They pair perfectly with whole-grain bread or sourdough for long-lasting energy that won't leave you feeling overfull. Add cheese or a sprinkle of nutritional yeast." },
    { type: "h3", text: "4. Smoothies" },
    { type: "p", text: "Smoothies are both easy to make and full of the nutrients necessary for an intense workout — a blend of fruit or vegetables, with protein powder and nuts or nut butter to cover all food groups. Try strawberry, Greek yogurt, carrot, flax seeds or nut butter — there are endless combinations to experiment with." },
    { type: "h3", text: "5. Energy bites or granola bars" },
    { type: "p", text: "Tasty and easy to grab if you're not a morning person, they provide a little protein and carbohydrate to fuel working muscles without leaving you heavy or uncomfortable. Granola bars are easy to make at home with oats, dried cranberries, mixed seeds and honey — make a batch and stock them up for the week." }
  ],

  "what-s-for-dinner": [
    { type: "p", text: "There is much importance placed on mealtimes and the portion size of those meals — breakfast with its ability to kick-start the day, and lunch as an opportunity to take a break to re-fuel and re-focus the mind. So what about dinner? Well, just as important — dinner has a number of essential functions for our body and mind." },
    { type: "h3", text: "Fuel for the body" },
    { type: "p", text: "Since it's the last meal of the day, it's important to make the right choices because you won't eat again for at least another 8 hours or so. Ensuring a steady supply of glucose for the body to use as fuel while we sleep is critical." },
    { type: "p", text: "A common cause of waking in the night, often seen in insomnia, is when levels of sugar in the blood fall. The body then has to release stored glucose, and this action can cause you to wake — and sometimes it's difficult to get back to sleep." },
    { type: "p", text: "To counteract this, it's essential to eat a good dinner that combines both protein and carbohydrates, which ensures a steady release of glucose into the bloodstream, helping prevent disturbed sleep. Skipping carbohydrates at dinner is never a good idea." },
    { type: "h3", text: "Food that makes you sleep well" },
    { type: "p", text: "As well as eating to balance blood sugar, we also need to eat correctly to get the right amino acids. Part of the building blocks of the body, they also work as neurotransmitters, transporting messages around the nervous system and playing an essential role in promoting well-being and mood." },
    { type: "p", text: "Serotonin is one such example — a deficiency is associated with mood disturbance, sleep problems, and aggressive or compulsive behaviour. We get serotonin after it's converted in the body from foods containing the amino acid tryptophan. It's worth remembering that tryptophan is carried into the brain via carbohydrate — another reason to have protein and carbs at dinner." },
    { type: "p", text: "A few of the dinner options that you can try:" },
    { type: "ol", items: [
      "Baked tofu with quinoa, chickpeas and spinach",
      "Thai curry with tofu and rice",
      "Black bean and veggie quesadillas",
      "Paneer bhurji roll with veggies",
      "Moong dal vegetable khichdi + curd"
    ] },
    { type: "quote", text: "Let us know in the comments below what your favourite dinner option would be." }
  ],

  "making-the-most-out-of-your-veggies": [
    { type: "p", text: "If the sight of carrots or broccoli gives you a gag, or just the sound of your mom asking you to finish the veggies on your plate makes you sad, then you have to read this — we'll try to turn \"veggie haters\" into \"veggie lovers.\"" },
    { type: "p", text: "Less than 27% of adults, and just 18% of children, eat the recommended five-a-day of fruit and veg. Vegetables are mostly cheap, nutritious and readily available — so what's the problem?" },
    { type: "p", text: "Dietary advice changes rapidly — it may be about carbs or good fat — but one piece of advice never fades: vegetables are good for you. Veggies are incredibly rich in nutrients and antioxidants, which boost your health and help fight off disease." },
    { type: "p", text: "Below are ways to incorporate veggies into your diet, so you don't get sick of them." },
    { type: "h3", text: "1. Make veggie soup" },
    { type: "p", text: "Everyone likes soup, and it's a perfect small meal or filler during the day. It's easy to make a vegetable broth, or a veggie-based soup by puréeing them and adding spices — like a tomato or carrot-based soup. Try adding cut vegetables as toppings for extra fibre, vitamins and minerals." },
    { type: "h3", text: "2. Experiment with veggie noodles" },
    { type: "p", text: "Veggie noodles are easy to make and a great way to get more veggies in your diet — an excellent low-carb substitute for high-carb foods like pasta. You can use a spiral slicer for almost any vegetable, commonly zucchini, carrots and sweet potatoes. Once the \"noodles\" are made, consume them just like pasta, combined with sauces, other vegetables and a source of protein." },
    { type: "h3", text: "3. Add veggies to your smoothies" },
    { type: "p", text: "Smoothies make for a refreshing breakfast or pre- or post-workout drink. Typically made by combining fruit with ice, milk or water in a blender, you can also add veggies without compromising the flavour. Adding spinach, kale, broccoli, carrots or beetroot to smoothies is an easy way to get more nutrients." },
    { type: "h3", text: "4. Grill veggies" },
    { type: "p", text: "Veggie kebabs are a great dish to try if you want to increase your veggie intake. Place chopped vegetables of your choice on a skewer and cook on a grill or barbecue. Bell peppers, onions and tomatoes work well for kebabs — you can also grill mushrooms, zucchini and sweet potatoes with spices, or marinate in yogurt." },
    { type: "h3", text: "Bottom line" },
    { type: "p", text: "There are many unique ways to include more vegetables in your diet — make \"noodles\" or \"kebabs,\" or incorporate them into soups or salads. By making veggies a regular part of your eating habits, you'll significantly increase your intake of fibre, nutrients, vitamins, minerals and antioxidants. Eating enough vegetables is also associated with a reduced risk of heart disease, high blood pressure, diabetes and cancer, and is beneficial for weight control. At the end of the day, you can't go wrong eating more veggies." }
  ],

  "do-dont-type-2-diabetes": [
    { type: "p", text: "Type-2 diabetes is not a disease but a lifestyle disorder. This means that poor dietary habits and lifestyle can lead to type-2 diabetes — and it also means that to help manage the condition, your lifestyle and food habits play an important role." },
    { type: "ol", items: [
      "Be active. If you have type-2 diabetes and your blood sugar keeps fluctuating and doesn't seem to be in control, make an effort to be more active. Invest in at least an hour of exercise, and take small efforts throughout the day — like getting up to open the door when the bell rings — rather than leading a sedentary lifestyle.",
      "Include high-fibre foods regularly in your diet, like spinach, sprouts, broccoli and other green leafy vegetables — they keep you full for longer and help keep your sugar levels stable.",
      "Don't keep long gaps between meals. The longer the gap between meals, the more you end up eating at the next one because you're hungry — and the more you eat, the more your sugar levels fluctuate.",
      "A diabetic can safely have 1–2 fruits a day, but having too many fruits or fruit juices together, or snacking on a huge fruit platter, is what disturbs sugar levels. Opt for fruits with less sugar content, like apple, papaya, oranges, berries, guava, cherries, plums and peaches.",
      "Drink a good amount of water throughout the day, and use low-fat dairy versions of milk, yogurt and cheese, which are rich in calcium, protein and minerals.",
      "Chronic stress and poor sleep are obviously among the don'ts of diabetes. Most of our hormonal balance occurs while we sleep, and most hormonal imbalance occurs when we're chronically stressed — and insulin is nothing but a hormone. So managing both stress and good sleep is important for healing."
    ] },
    { type: "p", text: "Only a few changes in your dietary habits can help you stay healthy and fight diabetes. All you need is a smart nutrition plan and a little discipline to stick with it. Try incorporating these dos and don'ts into your daily life and experience the change yourself." },
    { type: "quote", text: "For diabetes management and consultation, please book an appointment with our nutritionist now." }
  ],

  "recipe-of-the-day": [
    { type: "quote", text: "A recipe for easy butternut squash soup with crunchy roasted chickpeas and mushrooms — gluten-free, vegan and wholesome." },
    { type: "p", text: "It's amazing how easy and delicious this recipe came out to be. Butternut squash soup on its own seemed a little plain, so I decided to add some crunch with roasted chickpeas." },
    { type: "h3", text: "Ingredients" },
    { type: "ul", items: [
      "1 medium onion, chopped",
      "3 medium carrots, peeled and chopped",
      "1 medium butternut squash, peeled, seeded and chopped into 1-inch cubes (about 5 cups)",
      "1 large apple, peeled and chopped",
      "3 cups vegetable broth",
      "1/2 teaspoon ground cinnamon",
      "1/4 teaspoon ground nutmeg",
      "2 tablespoons maple syrup",
      "Salt and freshly ground black pepper to taste"
    ] },
    { type: "p", text: "For the roasted chickpeas:" },
    { type: "ul", items: [
      "1.5 cups chickpeas (garbanzo beans)",
      "1 tablespoon olive oil",
      "1/4 teaspoon ground cinnamon",
      "1/8 teaspoon salt"
    ] },
    { type: "p", text: "For the sautéed mushrooms:" },
    { type: "ul", items: [
      "1 tablespoon olive oil",
      "250 grams button mushrooms",
      "Salt, to taste",
      "Black pepper, to taste"
    ] },
    { type: "h3", text: "Method" },
    { type: "ol", items: [
      "Add the onion, carrots, butternut squash and apple to the slow cooker. Pour the vegetable broth over all the ingredients. Cook on high for 3 to 4 hours, or until the vegetables are soft.",
      "Once the vegetables are cooked and soft, purée the soup using an immersion blender. Add the cinnamon, nutmeg and maple syrup, and season with salt and pepper to taste. (You can instead carefully transfer the soup to a blender, in batches, and purée until smooth, then pour it back into the slow cooker and season.)",
      "While the soup is cooking, make the roasted chickpeas. Preheat the oven to 200°C. Rinse and drain the chickpeas and pat dry with a towel, removing the skins by rolling them on the towel. In a small bowl, combine the olive oil, cinnamon and salt, then toss with the chickpeas on a large baking sheet. Bake for 40–45 minutes, stirring every 15 minutes, until crunchy.",
      "While the chickpeas are in the oven, sauté the mushrooms — heat olive oil in a pan, add the chopped mushrooms, and sauté until soft. Season with salt and black pepper and cook through.",
      "Pour the soup into bowls and garnish with the roasted chickpeas and sautéed mushrooms. Serve immediately."
    ] }
  ]
};
