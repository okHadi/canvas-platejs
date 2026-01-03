// Template: Content Slide
// Standard slide with title and bullet points

export const contentSlideTemplate = {
    id: 'content-slide',
    name: 'Content Slide',
    description: 'Title with bullet points for main content',
    thumbnail: '📝',
    style: {
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%)',
    },
    htmlSource: `<div class="slide content-slide" style="background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%);">
  <div class="slide-title">
    <h2>Slide Title</h2>
  </div>
  <div class="slide-content">
    <ul>
      <li>First key point goes here</li>
      <li>Second important point</li>
      <li>Third supporting detail</li>
      <li>Additional information as needed</li>
    </ul>
  </div>
</div>`,
    areas: {
        title: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: 'Slide Title' }],
                },
            ],
            placeholder: 'Enter slide title...',
            className: 'title-editor content-title',
        },
        subtitle: null,
        content: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: '• First key point goes here' }],
                },
                {
                    type: 'paragraph',
                    children: [{ text: '• Second important point' }],
                },
                {
                    type: 'paragraph',
                    children: [{ text: '• Third supporting detail' }],
                },
                {
                    type: 'paragraph',
                    children: [{ text: '• Additional information as needed' }],
                },
            ],
            placeholder: 'Add your content...',
            className: 'content-editor',
        },
    },
};
