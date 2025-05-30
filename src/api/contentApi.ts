import { ContentType, ContentItem, ContentTypeField } from '../types/content';

// Mock data
const mockContentTypes: ContentType[] = [
  {
    id: '1',
    name: 'Articles',
    slug: 'articles',
    fields: [
      {
        id: '1',
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        order: 0
      },
      {
        id: '2',
        name: 'content',
        label: 'Content',
        type: 'textarea',
        required: true,
        order: 1
      },
      {
        id: '3',
        name: 'author',
        label: 'Author',
        type: 'text',
        required: true,
        order: 2
      },
      {
        id: '4',
        name: 'publishDate',
        label: 'Publish Date',
        type: 'date',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: '2',
    name: 'Products',
    slug: 'products',
    fields: [
      {
        id: '1',
        name: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        order: 0
      },
      {
        id: '2',
        name: 'price',
        label: 'Price',
        type: 'number',
        required: true,
        order: 1
      },
      {
        id: '3',
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        order: 2
      },
      {
        id: '4',
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
        order: 3
      },
      {
        id: '5',
        name: 'inStock',
        label: 'In Stock',
        type: 'boolean',
        required: true,
        order: 4
      }
    ]
  }
];

const mockContentItems: Record<string, ContentItem[]> = {
  '1': [
    {
      id: '1',
      contentTypeId: '1',
      values: {
        title: 'Sample Article',
        content: 'This is a sample article content',
        author: 'John Doe'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  '2': [
    {
      id: '1',
      contentTypeId: '2',
      values: {
        name: 'Sample Product',
        price: '99.99',
        description: 'This is a sample product'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Helper function to get content types from localStorage
const getStoredContentTypes = (): ContentType[] => {
  const stored = localStorage.getItem('contentTypes');
  console.log('Stored content types:', stored);
  if (!stored) {
    console.log('No stored content types, initializing with mock data');
    saveContentTypes(mockContentTypes);
    return mockContentTypes;
  }
  return JSON.parse(stored);
};

// Helper function to save content types to localStorage
const saveContentTypes = (types: ContentType[]) => {
  console.log('Saving content types:', types);
  localStorage.setItem('contentTypes', JSON.stringify(types));
  // Dispatch storage event to notify other tabs/windows
  window.dispatchEvent(new Event('storage'));
};

// Helper function to get content items from localStorage
const getStoredContentItems = (): ContentItem[] => {
  const stored = localStorage.getItem('contentItems');
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save content items to localStorage
const saveContentItems = (items: ContentItem[]) => {
  localStorage.setItem('contentItems', JSON.stringify(items));
};

// Content Types
export const getContentTypes = async () => {
  const types = getStoredContentTypes();
  return { data: types };
};

export const getContentType = async (id: string) => {
  console.log('Getting content type with ID:', id);
  const types = getStoredContentTypes();
  console.log('Available content types:', types);
  const type = types.find(t => t.id === id);
  console.log('Found content type:', type);
  if (!type) {
    throw new Error('Content type not found');
  }
  return { data: type };
};

export const createContentType = async (type: Omit<ContentType, 'id'>) => {
  const types = getStoredContentTypes();
  const newType = {
    ...type,
    id: Date.now().toString(),
    fields: type.fields || []
  };
  types.push(newType);
  saveContentTypes(types);
  return { data: newType };
};

export const updateContentType = async (id: string, type: ContentType) => {
  const types = getStoredContentTypes();
  const index = types.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error('Content type not found');
  }
  const updatedType = {
    ...type,
    fields: type.fields || []
  };
  types[index] = updatedType;
  saveContentTypes(types);
  return { data: updatedType };
};

export const deleteContentType = async (id: string) => {
  const types = getStoredContentTypes();
  const filteredTypes = types.filter(t => t.id !== id);
  saveContentTypes(filteredTypes);
  
  // Also delete all items of this type
  const items = getStoredContentItems();
  const filteredItems = items.filter(item => item.contentTypeId !== id);
  saveContentItems(filteredItems);
  
  return { data: { id } };
};

// Content Items
export const getContentItems = async (contentTypeId: string) => {
  const items = getStoredContentItems();
  const filteredItems = items.filter(item => item.contentTypeId === contentTypeId);
  return { data: filteredItems };
};

export const getContentItem = async (contentTypeId: string, itemId: string) => {
  const items = getStoredContentItems();
  const item = items.find(i => i.contentTypeId === contentTypeId && i.id === itemId);
  if (!item) {
    throw new Error('Content item not found');
  }
  return { data: item };
};

export const createContentItem = async (contentTypeId: string, item: Omit<ContentItem, 'id' | 'contentTypeId'>) => {
  const items = getStoredContentItems();
  const newItem = {
    ...item,
    id: Date.now().toString(),
    contentTypeId,
  };
  items.push(newItem);
  saveContentItems(items);
  return { data: newItem };
};

export const updateContentItem = async (contentTypeId: string, itemId: string, item: ContentItem) => {
  const items = getStoredContentItems();
  const index = items.findIndex(i => i.contentTypeId === contentTypeId && i.id === itemId);
  if (index === -1) {
    throw new Error('Content item not found');
  }
  items[index] = item;
  saveContentItems(items);
  return { data: item };
};

export const deleteContentItem = async (contentTypeId: string, itemId: string) => {
  const items = getStoredContentItems();
  const filteredItems = items.filter(i => !(i.contentTypeId === contentTypeId && i.id === itemId));
  saveContentItems(filteredItems);
  return { data: { id: itemId } };
}; 