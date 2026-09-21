import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, X } from 'lucide-react';
import { createProperty, updateProperty } from '../../firebase/firestore';
import { uploadPropertyImage } from '../../firebase/storage';
import { useAuth } from '../../context/AuthContext';
import type {
  PropertyDocument,
  PropertyType,
  PropertyListingType,
  PropertyStatusType,
  FurnishedStatus
} from '../../types/firebaseModels';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingProperty?: PropertyDocument | null;
}

const PROPERTY_TYPES: PropertyType[] = ['Apartment', 'Villa', 'House', 'Plot', 'Commercial', 'Office', 'Shop'];
const LISTING_TYPES: PropertyListingType[] = ['Sale', 'Rent', 'Lease'];
const FURNISHED_STATUSES: FurnishedStatus[] = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const COMMON_AMENITIES = [
  'Swimming Pool', 'Private Garden', 'Gym / Fitness Center', 'Clubhouse',
  '24/7 Concierge', 'Sea View', 'Golf Course View', 'Smart Home Automation',
  'Solar Powered', 'High-Speed WiFi', 'Covered Parking', 'EV Charging Station'
];

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProperty
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState(existingProperty?.title || '');
  const [description, setDescription] = useState(existingProperty?.description || '');
  const [propertyType, setPropertyType] = useState<PropertyType>(existingProperty?.propertyType || 'Apartment');
  const [listingType, setListingType] = useState<PropertyListingType>(existingProperty?.listingType || 'Sale');
  const [status, setStatus] = useState<PropertyStatusType>(existingProperty?.status || 'available');
  const [price, setPrice] = useState<number>(existingProperty?.price || 15000000);
  const [rentAmount, setRentAmount] = useState<number>(existingProperty?.rentAmount || 75000);
  const securityDeposit = existingProperty?.securityDeposit || 200000;
  const [bedrooms, setBedrooms] = useState<number>(existingProperty?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState<number>(existingProperty?.bathrooms || 3);
  const [area, setArea] = useState<number>(existingProperty?.area || 2200);
  const areaUnit = existingProperty?.areaUnit || 'sq.ft';
  const [furnishedStatus, setFurnishedStatus] = useState<FurnishedStatus>(existingProperty?.furnishedStatus || 'Fully Furnished');
  const [address, setAddress] = useState(existingProperty?.address || '');
  const [city, setCity] = useState(existingProperty?.city || 'Mumbai');
  const [state, setState] = useState(existingProperty?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(existingProperty?.pincode || '400050');
  const latitude = existingProperty?.latitude || 19.076;
  const longitude = existingProperty?.longitude || 72.8777;
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(existingProperty?.amenities || ['Swimming Pool', 'Covered Parking']);
  const [existingImages, setExistingImages] = useState<string[]>(existingProperty?.images || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to manage properties.');
      return;
    }
    if (!title.trim() || !address.trim() || !city.trim()) {
      setError('Please provide title, address, and city.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalImages = [...existingImages];

      // Handle Image Uploads to Firebase Storage
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        const tempId = existingProperty?.propertyId || 'prop_' + Date.now();
        for (const file of selectedFiles) {
          const downloadUrl = await uploadPropertyImage(tempId, file);
          finalImages.push(downloadUrl);
        }
        setUploadingImages(false);
      }

      // If no images provided, supply a luxury architectural cover
      if (finalImages.length === 0) {
        finalImages.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
      }

      if (existingProperty) {
        await updateProperty(existingProperty.propertyId, {
          title: title.trim(),
          description: description.trim(),
          propertyType,
          listingType,
          status,
          price: Number(price),
          rentAmount: listingType === 'Rent' ? Number(rentAmount) : undefined,
          securityDeposit: Number(securityDeposit),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          areaUnit,
          furnishedStatus,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          amenities: selectedAmenities,
          images: finalImages
        });
      } else {
        await createProperty({
          ownerId: user.id,
          title: title.trim(),
          description: description.trim(),
          propertyType,
          listingType,
          status,
          price: Number(price),
          rentAmount: listingType === 'Rent' ? Number(rentAmount) : undefined,
          securityDeposit: Number(securityDeposit),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          area: Number(area),
          areaUnit,
          furnishedStatus,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
          amenities: selectedAmenities,
          images: finalImages,
          isFeatured: false
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(err.message || 'Failed to save property listing.');
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingProperty ? 'Edit Property Listing' : 'List New Property'}
    >
      <form onSubmit={handleSubmit} style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        {/* Basic Details */}
        <div className="form-group">
          <label className="form-label" htmlFor="prop-title">Property Title *</label>
          <input
            id="prop-title"
            type="text"
            className="form-input"
            placeholder="e.g. Imperial Penthouse with Horizon Pool"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="prop-desc">Description</label>
          <textarea
            id="prop-desc"
            className="form-input"
            rows={3}
            placeholder="Detail architectural highlights, finishes, panoramic views, and security."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Selects: Property Type, Listing Type, Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select
              className="form-input"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            >
              {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Listing Type</label>
            <select
              className="form-input"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as PropertyListingType)}
            >
              {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatusType)}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Price (INR) *</label>
            <input
              type="number"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>

          {listingType === 'Rent' && (
            <div className="form-group">
              <label className="form-label">Monthly Rent</label>
              <input
                type="number"
                className="form-input"
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Furnishing</label>
            <select
              className="form-input"
              value={furnishedStatus}
              onChange={(e) => setFurnishedStatus(e.target.value as FurnishedStatus)}
            >
              {FURNISHED_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Specs: Bedrooms, Bathrooms, Area */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <input
              type="number"
              className="form-input"
              value={bedrooms}
              min={0}
              onChange={(e) => setBedrooms(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <input
              type="number"
              className="form-input"
              value={bathrooms}
              min={0}
              onChange={(e) => setBathrooms(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Area ({areaUnit})</label>
            <input
              type="number"
              className="form-input"
              value={area}
              min={1}
              onChange={(e) => setArea(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Location Details */}
        <div className="form-group">
          <label className="form-label">Address Line *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Street address, building name, locality"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input
              type="text"
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">State *</label>
            <input
              type="text"
              className="form-input"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              type="text"
              className="form-input"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="form-group">
          <label className="form-label">Amenities & Features</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
            {COMMON_AMENITIES.map(a => {
              const selected = selectedAmenities.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: selected ? 'var(--gold-primary)' : 'var(--bg-secondary)',
                    color: selected ? 'var(--gold-text)' : 'var(--text-secondary)',
                    border: selected ? 'none' : '1px solid var(--border-medium)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Property Images (Firebase Storage) */}
        <div className="form-group">
          <label className="form-label">Property Photos (Stored in Firebase Storage)</label>
          
          {/* Existing images list */}
          {existingImages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {existingImages.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={url} alt="prop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      backgroundColor: 'rgba(0,0,0,0.7)', color: 'white',
                      border: 'none', borderRadius: '50%', width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New files to upload */}
          {selectedFiles.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {selectedFiles.map((f, i) => (
                <div key={i} style={{
                  padding: '0.3rem 0.6rem', backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-medium)'
                }}>
                  <span>{f.name.slice(0, 15)}...</span>
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSelectedFile(i)} />
                </div>
              ))}
            </div>
          )}

          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1.25rem',
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-secondary)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            <Upload size={18} style={{ color: 'var(--gold-primary)' }} />
            <span>Click to upload property images (JPG, PNG, WEBP)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
          style={{ marginTop: '1.5rem', height: '44px' }}
        >
          {uploadingImages ? 'Uploading Photos to Firebase Storage...' :
           loading ? 'Publishing to Firestore...' :
           existingProperty ? 'Update Property Listing' : 'Publish Property Listing'}
        </button>
      </form>
    </Modal>
  );
};
