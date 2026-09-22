export type ServiceCategory = "sports" | "clinical" | "lifestyle" | "soon";

export interface Service {
  name: string;
  cat: ServiceCategory;
  icon: keyof typeof ICON_PATHS;
  duration: string;
  price: number | null;
  img: string;
  desc: string;
}

// Inline SVG path data for each service icon, viewBox 0 0 24 24.
export const ICON_PATHS = {
  counseling: '<path d="M4 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="10" cy="7" r="4"/>',
  diabetes: '<path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  pcod: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  weight: '<path d="M4 20h16"/><path d="M6 20V10l6-6 6 6v10"/><path d="M10 20v-6h4v6"/>',
  pregnancy: '<circle cx="12" cy="6" r="3"/><path d="M9 9c-3 1-4 4-4 8v3h14v-3c0-4-1-7-4-8"/>',
  sports: '<path d="M13 4 4 13l7 7 9-9-7-7Z"/><path d="m14.5 5.5 4 4"/>',
  bride: '<path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.4 5 6 5c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 3.6 0 5.3 3.9 3.5 7.5C19 16.65 12 21 12 21Z"/>',
  skin: '<circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/>',
  gut: '<path d="M8 3c-2 0-3 2-2 4 1 1.5 3 1.5 3 3.5S7 14 7 16.5 9.5 21 12 21s5-2 5-4.5-2-3.5-2-5.5 2-2 2-4c0-2.5-2-4.5-4.5-4.5"/>',
  heart: '<path d="M12 21s-7-4.35-9.5-8.5C.7 8.9 2.4 5 6 5c2 0 3.5 1.2 4 2 .5-.8 2-2 4-2 3.6 0 5.3 3.9 3.5 7.5C19 16.65 12 21 12 21Z"/><path d="M8 12h2l1.5-3L13 15l1.5-3H16"/>',
  run: '<circle cx="15" cy="5" r="2"/><path d="M13 8 7 10l1 5-4 5"/><path d="m10 12 3 2 4-1"/><path d="M12 13l2 6h3"/>',
  soon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
} as const;

export const CAT_LABEL: Record<ServiceCategory, string> = {
  sports: "Sports & Performance",
  clinical: "Clinical Nutrition",
  lifestyle: "Lifestyle & Personal",
  soon: "Coming Soon"
};

export const SERVICES: Service[] = [
  { name: "Personal Nutrition Counseling", cat: "lifestyle", icon: "counseling", duration: "1 hr", price: 4500, img: "food-greens-flatlay.jpg",
    desc: "Lifestyle, blood-work and body-fat assessment, a personalised meal plan, weekly tracking and a check-in every 3 weeks." },
  { name: "Diabetes Management", cat: "clinical", icon: "diabetes", duration: "45 min", price: 4500, img: "topic-diabetes.jpg",
    desc: "A plan built around duration of diabetes, Type 1 vs 2, health conditions and lifestyle — customised diet, portion size and cooking tips." },
  { name: "PCOD Management", cat: "clinical", icon: "pcod", duration: "1 hr", price: 4500, img: "food-pumpkin-seeds.jpg",
    desc: "Customised diet plan, portion size and cooking tips built around PCOD." },
  { name: "Healthy Weight at an Age", cat: "lifestyle", icon: "weight", duration: "1 hr", price: 4500, img: "food-apple-pb-dip.jpg",
    desc: "Customised diet plan, portion size and cooking tips for healthy weight management at any life stage." },
  { name: "Pregnancy Diet Management", cat: "clinical", icon: "pregnancy", duration: "40 min", price: 4500, img: "food-smoothie.jpg",
    desc: "Customised diet plan, portion size and cooking tips through pregnancy and lactation." },
  { name: "Sports Nutrition", cat: "sports", icon: "sports", duration: "1 hr", price: 4500, img: "topic-pilates.jpg",
    desc: "Training-day diets, competition prep, hydration strategy and fatigue reduction for triathlon, marathon, rowing, rugby, swimming, sailing and basketball." },
  { name: "Bride/Grooms-to-be", cat: "lifestyle", icon: "bride", duration: "1 hr", price: 3000, img: "kaasha-papaya-skewers.jpg",
    desc: "A plan to help you tone down and stay healthy through an exciting but stressful time — with a focus on skin glow and hair health." },
  { name: "Healthy Skin, Hair & Nails", cat: "lifestyle", icon: "skin", duration: "40 min", price: 2500, img: "food-watermelon-feta.jpg",
    desc: "Customised diet plan, portion size and cooking tips for skin, hair and nail health." },
  { name: "Gut Health", cat: "clinical", icon: "gut", duration: "40 min", price: 4500, img: "food-mushroom-stroganoff.jpg",
    desc: "Customised diet plan, portion size and cooking tips focused on gut health." },
  { name: "Management of Heart Health", cat: "clinical", icon: "heart", duration: "40 min", price: 4500, img: "topic-fire-veg.jpg",
    desc: "Customised diet plan, portion size and cooking tips for heart health." },
  { name: "Train to Run, Eat to Perform", cat: "sports", icon: "run", duration: "1 hr", price: 4500, img: "food-cucumber-pb-snack.jpg",
    desc: "A marathon runners' diet — nutrition built around your training block and race day." },
  { name: "Healthy Cooking Classes", cat: "soon", icon: "soon", duration: "", price: null, img: "food-chef-prep.jpg", desc: "Coming soon." },
  { name: "Changing Habits", cat: "soon", icon: "soon", duration: "", price: null, img: "topic-journal.jpg", desc: "Coming soon." },
  { name: "Grocery Tours", cat: "soon", icon: "soon", duration: "", price: null, img: "vallari-citrus.jpg", desc: "Coming soon." }
];

/**
 * The broad list of nutrition areas Vallari covers, migrated from the
 * "Nutrition Services" panel on the original Kaasha Wix homepage. Used for
 * the homepage services teaser; the full bookable catalogue above (with
 * pricing and descriptions) lives on the dedicated /services page.
 */
export const NUTRITION_SERVICES_INTRO =
  "If you're ready to strike a perfect balance with food and lifestyle, I am here for you with super-customised nutrition. I offer personalised nutrition plans in a variety of areas, including:";

export const NUTRITION_SERVICES_LIST = [
  "Weight Management",
  "Sports Nutrition",
  "Diabetes",
  "Thyroid",
  "PCOS",
  "Pregnancy & Lactation",
  "Child Nutrition",
  "Management of Hypertension",
  "Management of Cholesterol",
  "Personalised diet to reach your health goal",
  "Bridal diet-to-be — Brides & Grooms"
];

export type PostCategory = "Healthy Tips" | "Living Well" | "Recipes";

export interface Post {
  t: string;
  slug: string;
  cat: PostCategory;
  date: string;
  read: string;
  img: string;
  featured?: boolean;
}

export const CAT_CLASS: Record<PostCategory, string> = {
  "Healthy Tips": "tips",
  "Living Well": "living",
  "Recipes": "recipes"
};

export const ORIGINAL_BLOG_URL = "https://kaashabyvallarishah.wixsite.com/mysite-1/blog";

export const POSTS: Post[] = [
  { t: "Vegan Mushroom Stroganoff", slug: "vegan-mushroom-stroganoff", cat: "Recipes", date: "Nov 21, 2020", read: "2 min", img: "food-mushroom-stroganoff.jpg", featured: true },
  { t: "Why It Makes Sense To Eat Seasonal?!!", slug: "why-it-makes-sence-to-eat-seasonal", cat: "Living Well", date: "Nov 9, 2020", read: "2 min", img: "food-greens-flatlay.jpg" },
  { t: "Healthy Herbal Teas!!", slug: "healthy-herbal-teas", cat: "Healthy Tips", date: "Oct 3, 2020", read: "2 min", img: "vallari-tea.jpg" },
  { t: "Is Cutting Down Completely On Salt Sensible?!!", slug: "is-cutting-down-completely-on-salt-sensible", cat: "Healthy Tips", date: "Sep 18, 2020", read: "2 min", img: "vallari-citrus.jpg" },
  { t: "Let's Get Cheesy!!!!", slug: "lets-get-all-cheesy", cat: "Recipes", date: "Aug 14, 2020", read: "3 min", img: "food-watermelon-feta.jpg" },
  { t: "Why Diet Is Important For Hair Growth?!", slug: "why-diet-is-important-for-hair-growth", cat: "Healthy Tips", date: "Aug 5, 2020", read: "2 min", img: "vallari-caprese.jpg" },
  { t: "Food You Think Are Healthy But Really Are Not!!!!", slug: "foods-you-think-are-healthy-but-really-are-not", cat: "Healthy Tips", date: "Jul 14, 2020", read: "3 min", img: "topic-fire-veg.jpg" },
  { t: "Meditation and Nutrition", slug: "meditation-and-nutrition", cat: "Living Well", date: "May 30, 2020", read: "3 min", img: "topic-meditation.jpg" },
  { t: "Quarantine, Food And Healthy You!!!", slug: "quarantine-food-and-healthy-you", cat: "Healthy Tips", date: "Apr 21, 2020", read: "2 min", img: "vallari-strawberries.jpg" },
  { t: "Food For Happy Hormones :)", slug: "food-for-happy-hormones", cat: "Healthy Tips", date: "Apr 16, 2020", read: "3 min", img: "food-smoothie.jpg" },
  { t: "Herbs and Garlic Amaranth Crackers", slug: "herbs-and-garlic-amaranth-crackers", cat: "Recipes", date: "Feb 6, 2020", read: "2 min", img: "food-amaranth-crackers.jpg" },
  { t: "Is The Sugar In Fruit Bad For Me??", slug: "is-the-sugar-in-fruit-bad-for-me", cat: "Healthy Tips", date: "Jan 9, 2020", read: "3 min", img: "topic-pink-fruit.jpg" },
  { t: "Healthy Office Snacks To Keep You Energised", slug: "healthy-office-snacks-to-keep-you-energised", cat: "Healthy Tips", date: "Aug 31, 2019", read: "3 min", img: "topic-journal.jpg" },
  { t: "Fitness Food On Budget", slug: "fitness-food-on-any-budget", cat: "Healthy Tips", date: "Aug 5, 2019", read: "2 min", img: "food-chef-prep.jpg" },
  { t: "Cold and Cough Remedies Right From Your Kitchen!!!", slug: "cold-and-cough-remedies-right-from-your-kitchen", cat: "Healthy Tips", date: "Jul 24, 2019", read: "1 min", img: "topic-cold-remedy.jpg" },
  { t: "Ways To Fuel For Early Morning Work-out", slug: "ways-to-fuel-for-early-morning-work-out", cat: "Healthy Tips", date: "Jun 20, 2019", read: "2 min", img: "topic-pilates.jpg" },
  { t: "What's For Dinner??!!", slug: "what-s-for-dinner", cat: "Recipes", date: "Jun 19, 2019", read: "2 min", img: "food-caprese-plated.jpg" },
  { t: "Making The Most Out Of Your Veggies", slug: "making-the-most-out-of-your-veggies", cat: "Living Well", date: "May 2, 2019", read: "2 min", img: "vallari-boat.jpg" },
  { t: "Do and Don't – Type 2 Diabetes", slug: "do-dont-type-2-diabetes", cat: "Healthy Tips", date: "Apr 5, 2019", read: "2 min", img: "topic-diabetes.jpg" },
  { t: "Butternut Squash Soup With Roasted Chickpeas & Mushrooms", slug: "recipe-of-the-day", cat: "Recipes", date: "Mar 22, 2019", read: "2 min", img: "food-polenta-mushroom.jpg" }
];
