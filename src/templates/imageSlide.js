// Template: Image Slide
// Two-column layout with text and image placeholder

export const imageSlideTemplate = {
    id: 'image-slide',
    name: 'Image Slide',
    description: 'Two-column layout with text and image area',
    thumbnail: '🖼️',
    style: {
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
    },
    layout: 'two-column',
    htmlSource: `<div class="slide image-slide" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);">
  <div class="slide-title">
    <h2>Visual Story</h2>
  </div>
  <div class="two-column-layout">
    <div class="text-column">
      <p>Describe your visual content here. This area can contain explanatory text that complements the image.</p>
      <p>Add key takeaways or context for the visual element.</p>
    </div>
    <div class="image-column">
      <div class="image-placeholder">
        <img src="placeholder.jpg" alt="Image placeholder" />
      </div>
    </div>
  </div>
</div>`,
    areas: {
        title: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: 'Visual Story' }],
                },
            ],
            placeholder: 'Enter title...',
            className: 'title-editor image-title',
        },
        subtitle: null,
        content: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: 'Describe your visual content here. This area can contain explanatory text that complements the image.' }],
                },
                {
                    type: 'paragraph',
                    children: [{ text: '' }],
                },
                {
                    type: 'paragraph',
                    children: [{ text: 'Add key takeaways or context for the visual element.' }],
                },
            ],
            placeholder: 'Add description...',
            className: 'content-editor image-content',
        },
        image: {
            placeholder: 'Image Area',
            className: 'image-placeholder',
        },
    },
};
