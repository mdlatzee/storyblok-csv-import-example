const fs = require('fs') 
const csvReader = require('fast-csv')
const StoryblokClient = require('storyblok-js-client')

// Initialize the client with the oauth token
const Storyblok = new StoryblokClient({
  oauthToken: '15FsG6X53D3muRDNeTztMgtt-239478-H8h1kL_1oy6q8xyo_95x' // can be found in your My account section PUBLIC TOKEN
})

const config = {
  spaceId: '287314', // can be found in the space settings.
  parentFolder: '499734286' // navigate into your folder and copy the id from the URL at app.storyblok.com <- last one 
}

let stream = fs.createReadStream('test_category.csv')

csvReader.parseStream(stream, { headers: true, delimiter: ';' })
  .on('data', (line) => {
    // one line of csv in here
    let story = {
      slug: line.path,
      name: line.title,
      parent_id: config.parentFolder,
      content: {
        component: 'post',
        title: line.title,
        text: line.text,
        image: line.image,
        category: line.category
      }
    }

    Storyblok.post(`spaces/${config.spaceId}/stories/`, {
      story
    }).then(res => {
      console.log(`Success: ${res.data.story.name} was created.`)
    }).catch(err => {
      console.log(`Error: ${err}`)
    })
  })
  .on('end', () => {
    // Done reading the CSV - now we finally create the component with a definition for each field
    // we can also skip that and define the content type using the interface at app.storyblok.com
    let component = {
      name: "post",
      display_name: "Post",
      schema: {
        title: {
          type: "text",
          pos: 0
        },
        text: {
          type: "markdown",
          pos: 1
        },
        image: {
          type: "image",
          pos: 2
        },
        category: {
          type: "text",
          pos: 3
        }
      },
      is_root: true, // is content type
      is_nestable: false // is nestable (in another content type)
    }

    Storyblok.post(`spaces/${config.spaceId}/components/`, {
      component
    }).then(res => {
      console.log(`Success: ${res.data.component.name} was created.`)
    }).catch(err => {
      console.log(`Error: ${err}`)
    })
  })

