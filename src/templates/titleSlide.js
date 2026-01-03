// Template: Title Slide
// A bold title-focused slide for section openers

export const titleSlideTemplate = {
    id: 'title-slide',
    name: 'Title Slide',
    description: 'Bold title with subtitle for section openers',
    thumbnail: '📊',
    style: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
    htmlSource: `<div class="slide title-slide" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
  <div class="slide-title">
    <h1>Presentation Title</h1>
  </div>
  <div class="slide-subtitle">
    <p>Add a compelling subtitle here</p>
  </div>
</div>`,
    areas: {
        title: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: 'Presentation Title' }],
                },
            ],
            placeholder: 'Enter your title...',
            className: 'title-editor',
        },
        subtitle: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: 'Add a compelling subtitle here' }],
                },
            ],
            placeholder: 'Enter subtitle...',
            className: 'subtitle-editor',
        },
        content: null,
    },
};
