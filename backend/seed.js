const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Story = require('./models/Story');
const Notification = require('./models/Notification');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ECOM:ECOM@cluster0.1awf5ta.mongodb.net/SOCIAL_MEDIA?retryWrites=true&w=majority&appName=Cluster0';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Story.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing database collections');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const realUsers = [
      ['Alex Rivera', 'alex_rivera', 'alex@socialsphere.com', true],
      ['Sarah Chen', 'sarah_chen', 'sarah@socialsphere.com', false],
      ['Marcus Johnson', 'marcus_j', 'marcus@socialsphere.com', false],
      ['Emma Williams', 'emma_w', 'emma@socialsphere.com', true],
      ['James Thompson', 'james_t', 'james@socialsphere.com', false],
      ['Olivia Garcia', 'olivia_g', 'olivia@socialsphere.com', false],
      ['Liam Brown', 'liam_b', 'liam@socialsphere.com', true],
      ['Sophia Martinez', 'sophia_m', 'sophia@socialsphere.com', false],
      ['Noah Anderson', 'noah_a', 'noah@socialsphere.com', false],
      ['Isabella Taylor', 'isabella_t', 'isabella@socialsphere.com', false],
      ['Ethan Thomas', 'ethan_t', 'ethan@socialsphere.com', true],
      ['Mia Jackson', 'mia_j', 'mia@socialsphere.com', false],
      ['Lucas White', 'lucas_w', 'lucas@socialsphere.com', false],
      ['Charlotte Harris', 'charlotte_h', 'charlotte@socialsphere.com', false],
      ['Mason Clark', 'mason_c', 'mason@socialsphere.com', true],
      ['Amelia Lewis', 'amelia_l', 'amelia@socialsphere.com', false],
      ['Logan Walker', 'logan_w', 'logan@socialsphere.com', false],
      ['Harper Hall', 'harper_h', 'harper@socialsphere.com', false],
      ['Elijah Allen', 'elijah_a', 'elijah@socialsphere.com', true],
      ['Aria Young', 'aria_y', 'aria@socialsphere.com', false],
    ];

    const bios = [
      'Building the future, one line of code at a time.',
      'Designing experiences that matter. UI/UX enthusiast.',
      'Photographer. Traveler. Storyteller.',
      'Full-stack developer by day, gamer by night.',
      'Turning coffee into code since 2020.',
      'Digital artist exploring the intersection of art and tech.',
      'Startup founder. Building something awesome.',
      'Data nerd. Visualization artist.',
      'Writing about tech, life, and everything in between.',
      'Cloud architect. DevOps believer.',
    ];

    const usersToCreate = realUsers.map(([name, username, email, isVerified], i) => ({
      name,
      username,
      email,
      password: defaultPassword,
      profilePicture: `https://i.pravatar.cc/150?u=${i}`,
      coverPhoto: `https://picsum.photos/seed/cover${i}/1200/400`,
      bio: bios[i % bios.length],
      isVerified,
      isAdmin: i === 0,
      isOnline: Math.random() > 0.5,
      lastSeen: new Date(Date.now() - Math.floor(Math.random() * 100000000))
    }));

    let createdUsers = await User.insertMany(usersToCreate);
    console.log(`Created ${createdUsers.length} users`);

    // Add random followers/following
    for (let user of createdUsers) {
      const followCount = Math.floor(Math.random() * 10) + 2;
      const followingList = [...createdUsers]
        .sort(() => 0.5 - Math.random())
        .slice(0, followCount)
        .filter(u => u._id.toString() !== user._id.toString())
        .map(u => u._id);
      
      await User.findByIdAndUpdate(user._id, { following: followingList });
      for (const fId of followingList) {
        await User.findByIdAndUpdate(fId, { $addToSet: { followers: user._id } });
      }
    }

    const postsToCreate = [];
    for (let i = 1; i <= 100; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const hasImage = i % 2 === 0;
      const isReel = i % 10 === 0;
      
      const likesCount = Math.floor(Math.random() * 15);
      const randomLikes = [...createdUsers].sort(() => 0.5 - Math.random()).slice(0, likesCount).map(u => u._id);

      const postContents = [
        `Just shipped a major update! The team crushed it. 🚀 #build`,
        `Beautiful sunset today. Nature never disappoints. 🌅 #photography`,
        `Hot take: the best code is the code you don't write. #coding`,
        `Working on something exciting. Can't wait to share! #development`,
        `Anyone else love late-night coding sessions? ☕️ #programmer`,
        `Just hit 1000 followers! Thank you all so much! 🙏 #grateful`,
        `New blog post: "10 Tips for Cleaner Code" - link in bio #blog`,
        `Coffee + Code = Productivity 📈 #developer`,
        `The design community is incredible. Learned so much today. #design`,
        `Weekend project: built a full-stack app in 48 hours. #buildinpublic`,
        `TypeScript is the best thing that happened to JavaScript. #typescript`,
        `Started reading "Clean Architecture" - mind blown already. #books`,
        `Hot take: Tailwind CSS > vanilla CSS. Fight me. #css #tailwind`,
        `Deployed to production. No bugs. Is this real life? 😅 #dev`,
        `The tech community on SocialSphere is amazing. So much to learn! #community`,
      ];

      postsToCreate.push({
        author: randomUser._id,
        type: isReel ? 'reel' : 'post',
        content: isReel ? `Check out this short video! 🎬 #reel #video` : postContents[i % postContents.length],
        image: hasImage && !isReel ? `https://picsum.photos/seed/post${i}/800/600` : null,
        video: isReel ? `https://www.w3schools.com/html/mov_bbb.mp4` : null,
        likes: randomLikes,
        hashtags: ['#socialsphere', isReel ? '#reel' : '#post'],
        views: Math.floor(Math.random() * 500)
      });
    }

    const createdPosts = await Post.insertMany(postsToCreate);
    console.log(`Created ${createdPosts.length} posts`);

    // Seed Comments and Notifications
    const commentsToCreate = [];
    const notificationsToCreate = [];
    
    for (const post of createdPosts) {
      const commentCount = Math.floor(Math.random() * 5);
      for (let j = 0; j < commentCount; j++) {
        const commenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        const commentTexts = [
          'Totally agree with this! 🙌',
          'Great perspective, thanks for sharing!',
          'This is gold. Saving for later.',
          'Couldn\'t have said it better myself.',
          'Love this! Keep up the great work.',
          'Interesting take! I have a different opinion though.',
          'This changed my mind. Well argued.',
          'Bookmarking this! So useful.',
          'Fantastic content as always.',
          'Learned something new today. Thanks!',
        ];
        const newComment = new Comment({
          author: commenter._id,
          post: post._id,
          text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        });
        
        commentsToCreate.push(newComment);
        await Post.findByIdAndUpdate(post._id, { $push: { comments: newComment._id } });
        
        if (post.author.toString() !== commenter._id.toString()) {
          notificationsToCreate.push({
            recipient: post.author,
            sender: commenter._id,
            type: 'comment',
            post: post._id,
            comment: newComment._id
          });
        }
      }

      // Add like notifications
      for (const likerId of post.likes) {
        if (post.author.toString() !== likerId.toString()) {
          notificationsToCreate.push({
            recipient: post.author,
            sender: likerId,
            type: 'like',
            post: post._id
          });
        }
      }
    }

    await Comment.insertMany(commentsToCreate);
    console.log(`Created ${commentsToCreate.length} comments`);
    
    await Notification.insertMany(notificationsToCreate);
    console.log(`Created ${notificationsToCreate.length} notifications`);

    // Seed Stories
    const storiesToCreate = [];
    for (let i = 0; i < 15; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      storiesToCreate.push({
        author: randomUser._id,
        content: ['Morning vibes ☀️', 'Exploring new places 🌍', 'Coffee time ☕', 'Code mode 💻', 'Weekend feels 🎉', 'New project day!', 'Late night grind 🌙', 'Team lunch 🍕'][i % 8],
        media: `https://picsum.photos/seed/story${i}/400/800`,
        mediaType: 'image',
        views: []
      });
    }
    await Story.insertMany(storiesToCreate);
    console.log(`Created ${storiesToCreate.length} stories`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
