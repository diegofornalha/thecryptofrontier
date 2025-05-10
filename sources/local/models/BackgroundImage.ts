import { defineType } from "sanity";

export const BackgroundImage = defineType({
  type: 'object',
  name: 'BackgroundImage',
  title: 'BackgroundImage',
  label: 'BackgroundImage',
  labelField: 'altText',
  fields: [
    {
      type: 'image',
      name: 'url',
      title: 'Image',
      description: 'The URL of the image',
      required: false,
      hidden: false,
      localized: false
    },
    {
      type: 'string',
      name: 'altText',
      title: 'Alt text',
      description: 'The alt text of the image',
      required: false,
      default: 'altText of the image',
      hidden: false,
      localized: false
    },
    {
      type: 'enum',
      name: 'backgroundSize',
      title: 'Background size',
      required: false,
      default: 'auto',
      hidden: false,
      localized: false,
      options: [
        {
          label: 'Auto',
          value: 'auto'
        },
        {
          label: 'Cover',
          value: 'cover'
        },
        {
          label: 'Contain',
          value: 'contain'
        }
      ],
      group: 'styles',
      controlType: 'button-group'
    },
    {
      type: 'enum',
      name: 'backgroundPosition',
      title: 'Background position',
      required: false,
      default: 'center',
      hidden: false,
      localized: false,
      options: [
        {
          label: 'Bottom',
          value: 'bottom'
        },
        {
          label: 'Center',
          value: 'center'
        },
        {
          label: 'Left',
          value: 'left'
        },
        {
          label: 'Left bottom',
          value: 'left-bottom'
        },
        {
          label: 'Left top',
          value: 'left-top'
        },
        {
          label: 'Right',
          value: 'right'
        },
        {
          label: 'Right bottom',
          value: 'right-bottom'
        },
        {
          label: 'Right top',
          value: 'right-top'
        },
        {
          label: 'Top',
          value: 'top'
        }
      ],
      group: 'styles'
    },
    {
      type: 'enum',
      name: 'backgroundRepeat',
      title: 'Background repeat',
      required: false,
      default: 'no-repeat',
      hidden: false,
      localized: false,
      options: [
        {
          label: 'Repeat',
          value: 'repeat'
        },
        {
          label: 'Repeat X',
          value: 'repeat-x'
        },
        {
          label: 'Repeat Y',
          value: 'repeat-y'
        },
        {
          label: 'No repeat',
          value: 'no-repeat'
        }
      ],
      group: 'styles',
      controlType: 'button-group'
    },
    {
      type: 'number',
      name: 'opacity',
      title: 'Opacity',
      required: false,
      default: 100,
      hidden: false,
      localized: false,
      subtype: 'int',
      min: 0,
      max: 100,
      group: 'styles',
      controlType: 'slider',
      step: 1,
      unit: '%'
    }
  ],
  fieldGroups: [
    {
      name: 'styles',
      title: 'Styles',
      icon: 'palette'
    }
  ]
});