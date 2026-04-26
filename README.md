# Web Development Final Project - _Wideman Leatherworks Forum_

Submitted by: **Robby Wideman**

This web app: **is a place for leathercrafters to share the tips, tricks, and guidance. Users will be able to post questions/solutions to leatherworking tasks, discuss multiple topics about the hobby/passion, and even show off some of their work.**

Time spent: **18** hours _(at least)_ spent in total

## Required Features

The following **required** functionality is completed:

- [x] **Web app includes a create form that allows the user to create posts**
  - Form requires users to add a post title
  - Forms should have the _option_ for users to add:
    - additional textual content
    - an image added as an external image URL
- [x] **Web app includes a home feed displaying previously created posts**
  - Web app must include home feed displaying previously created posts
  - By default, each post on the posts feed should show only the post's:
    - creation time
    - title
    - upvotes count
  - Clicking on a post should direct the user to a new page for the selected post
- [x] **Users can view posts in different ways**
  - Users can sort posts by either:
    - creation time
    - upvotes count
  - Users can search for posts by title
- [x] **Users can interact with each post in different ways**
  - The app includes a separate post page for each created post when clicked, where any additional information is shown, including:
    - content
    - image
    - comments
  - Users can leave comments underneath a post on the post page
  - Each post includes an upvote button on the post page.
    - Each click increases the post's upvotes count by one
    - Users can upvote any post any number of times \*[NOTE: I'm a firm believer that in forums with up/downvotes, users should only get to vote once in either direction or choose not to vote and/or change their vote, therefore, ***my*** app only allows users to vote once. I also believe that if you allow upvotes, there should be the choice of down votes - and ***my*** project reflects that]\*

- [x] **A post that a user previously created can be edited or deleted from its post pages**
  - After a user creates a new post, they can go back and edit the post
  - A previously created post can be deleted from its post page

The following **optional** features are implemented:

- [x] Web app implements pseudo-authentication
  - [x] _NOPE, I went full-on user accounts, housed via the Supabase DB for the project_
  - Users can only edit and delete posts or delete comments by entering the secret key, which is set by the user during post creation
  - **or** upon launching the web app, the user is assigned a random user ID. It will be associated with all posts and comments that they make and displayed on them
  - For both options, only the original user author of a post can update or delete it
- [x] Users can repost a previous post by referencing its post ID. On the post page of the new post
  - Users can repost a previous post by referencing its post ID
  - On the post page of the new post, the referenced post is displayed and linked, creating a thread
- [x] Users can customize the interface
  - e.g., selecting the color scheme or showing the content and image of each post on the home feed
  - [x] _I added three primary themes plus "Naval Supremacy" since I was in the Navy_
- [x] Users can add more characterics to their posts
  - Users can share and view web videos
  - Users can set flags such as "Question" or "Opinion" while creating a post
  - Users can filter posts by flags on the home feed
  - Users can upload images directly from their local machine as an image file
- [x] Web app displays a loading animation whenever data is being fetched
  - _I have it set to state "Burnishing Edges..." which is a nod to one of the last steps in completing a leather project!_

The following **additional** features are implemented:

- [x] Users create their own unique profile, stored via the Supabase connection for the project. Users can go back and edit this as they see fit.
- [x] Users can add an avatar image to their profile (image can be a link or uploaded directly and stored on Supabase).
- [x] Post listings on either the home page aggregator or on the "Bench" (like a _subreddit_) page show the username and avatar of whoever posted it.
- [x] User comments show who made the comment and their avatar next to their username.
- [x] Special roles are used for site Admins and Moderators. Word badges show up next to their usernames.
- [x] Users can post multiple photos and/or a single video URL (like a YouTube link, etc.) in their posts/reposts.
- [x] When users have posts with images, clicking on those images opens a modal pane, enlarging the image. Multi-image posts can be cycled through by the viewer.
- [x] The image gallery modal can be closed by clicking the "x" in the top right of the modal, clicking out of the modal area, and my favorite - by tapping the ESC key.
- [x] When users select their web page theme from the drop down, the setting is saved in Supabase under their profile and not simply locally.
- [x] Users can upvote or downvote posts, but each user can only have one active vote per post. Votes can be changed or removed.
- [x] Post cards show image or video thumbnails on the home feed and bench pages.
- [x] YouTube links are embedded directly into post pages.
- [x] Posts can reference another post and display a linked referenced-post card.
- [x] Each post has a branded Bench ID with a copyable full UUID for referencing.
  - _Example of Bench ID (post ID) prefixes_
    - Showcase post → SCS-204
    - Sewing Pony post → SPY-118
    - Draft Desk post → DSK-455
    - Tool Rack post → TLR-088
    - Tannery post → TNY-510
    - Scrap Bin post → SCP-012
- [x] Users can add social links to their profile, and known platforms display as recognizable icons.
- [x] Users can edit their post galleries by adding, removing, and reordering images.
- [x] Row Level Security policies protect posts, comments, profiles, votes, and storage uploads.

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='http://i.imgur.com/link/to/your/gif/file.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

<!-- Replace this with whatever GIF tool you used! -->

GIF created with ...

<!-- Recommended tools:
[Kap](https://getkap.co/) for macOS
[ScreenToGif](https://www.screentogif.com/) for Windows
[peek](https://github.com/phw/peek) for Linux. -->

## Notes

Describe any challenges encountered while building the app.

## License

    Copyright 2026 Robby Wideman

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
