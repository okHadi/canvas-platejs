// Template: Quote Slide
// Centered quote with attribution

export const quoteSlideTemplate = {
    id: 'quote-slide',
    name: 'Quote Slide',
    description: 'Centered inspirational quote with attribution',
    thumbnail: '💬',
    style: {
        background: 'linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%)',
    },
    layout: 'centered',
    htmlSource: `<div class="slide quote-slide" style="background: linear-gradient(135deg, #232526 0%, #414345 50%, #232526 100%);">
  <blockquote class="quote">
    <p>"The only way to do great work is to love what you do."</p>
    <cite>— Steve Jobs</cite>
  </blockquote>
</div>`,
    areas: {
        title: null,
        subtitle: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: '"The only way to do great work is to love what you do."' }],
                },
            ],
            placeholder: 'Enter your quote...',
            className: 'quote-editor',
        },
        content: {
            defaultContent: [
                {
                    type: 'paragraph',
                    children: [{ text: '— Steve Jobs' }],
                },
            ],
            placeholder: 'Add attribution...',
            className: 'attribution-editor',
        },
    },
};
