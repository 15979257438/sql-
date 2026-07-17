import { useState, useEffect } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, Image, Input, Button, Textarea, ScrollView } from '@tarojs/components';
import { productService } from '@/services/productService';
import { uploadService } from '@/services/uploadService';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { CATEGORIES } from '@/constants/categories';
import { CONDITIONS } from '@/constants/conditions';
import { TRADE_METHODS } from '@/constants/tradeMethods';
import { validateTitle, validateDescription, validatePrice } from '@/utils/validation';
import { Skeleton, EmptyState } from '@/components/shared/Feedback';
import NavBar from '@/components/layout/NavBar';
import { goProduct, getPageParams } from '@/utils/nav';
import type { Category, Condition, TradeMethod } from '@/types';

interface ValidationState { title: { valid: boolean; message: string; touched: boolean }; description: { valid: boolean; message: string; touched: boolean }; price: { valid: boolean; message: string; touched: boolean }; }

export default function PublishEditPage() {
  const user = useAuthStore(s => s.user);
  const showToast = useUIStore(s => s.showToast);
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [condition, setCondition] = useState<Condition>('like_new');
  const [tradeMethod, setTradeMethod] = useState<TradeMethod>('both');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [validation, setValidation] = useState<ValidationState>({ title: { valid: true, message: '', touched: false }, description: { valid: true, message: '', touched: false }, price: { valid: true, message: '', touched: false } });
  const [shakingField, setShakingField] = useState<string | null>(null);

  useLoad(() => { const params = getPageParams(); if (params.id) setEditId(params.id); });

  useEffect(() => {
    if (!editId) return;
    setLoadingEdit(true);
    productService.getById(editId).then(p => {
      if (p) { setImages(p.images); setTitle(p.title); setDescription(p.description); setPrice(String(p.price)); setOriginalPrice(p.originalPrice ? String(p.originalPrice) : ''); setCategory(p.category); setCondition(p.condition); setTradeMethod(p.tradeMethod); setLocation(p.location || ''); }
      setLoadingEdit(false);
    });
  }, [editId]);

  const validateField = (field: string, value: string) => {
    let result = { valid: true, message: '' };
    if (field === 'title') { const err = validateTitle(value); if (err) result = { valid: false, message: err }; }
    else if (field === 'description') { const err = validateDescription(value); if (err) result = { valid: false, message: err }; }
    else if (field === 'price') { const priceNum = Number(value); if (!value) result = { valid: false, message: '请输入价格' }; else if (priceNum <= 0) result = { valid: false, message: '价格必须大于0' }; else if (priceNum > 99999) result = { valid: false, message: '价格不能超过99999' }; }
    setValidation(prev => ({ ...prev, [field]: { ...prev[field as keyof ValidationState], ...result, touched: true } }));
    if (!result.valid) { setShakingField(field); setTimeout(() => setShakingField(null), 300); }
    return result.valid;
  };

  const handleImageAdd = async () => {
    const remaining = 9 - images.length; if (remaining <= 0) return;
    setUploadProgress({ current: 0, total: 0 }); const newIds: string[] = [];
    try {
      const res = await Taro.chooseMedia({ count: remaining, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'] });
      const paths = res.tempFiles.map(f => f.tempFilePath);
      setUploadProgress({ current: 0, total: paths.length });
      for (let i = 0; i < paths.length; i++) { const id = await uploadService.upload(paths[i]); newIds.push(id); setUploadProgress({ current: i + 1, total: paths.length }); }
      setImages(prev => [...prev, ...newIds].slice(0, 9));
    } catch (err: any) { showToast(err.message || '图片上传失败', 'error'); } finally { setUploadProgress(null); }
  };
  const handleRemoveImage = (id: string) => { setImages(prev => prev.filter(i => i !== id)); };
  const getImageUrl = (id: string) => { if (id.startsWith('data:')) return id; return uploadService.getUrl(id) || id; };
  const validate = (): string | null => { const titleErr = validateTitle(title); if (titleErr) return titleErr; const descErr = validateDescription(description); if (descErr) return descErr; const priceErr = validatePrice(Math.round(Number(price) * 100)); if (priceErr) return priceErr; if (!category) return '请选择分类'; if ((tradeMethod === 'pickup' || tradeMethod === 'both') && !location.trim()) return '请选择交易方式并填写交易地点'; return null; };
  const handleSubmit = async () => {
    if (!editId) return; const error = validate(); if (error) { showToast(error, 'error'); return; }
    setSubmitting(true);
    try {
      const data = { title: title.trim(), description: description.trim(), price: Math.round(Number(price) * 100), originalPrice: originalPrice ? Math.round(Number(originalPrice) * 100) : undefined, category: category as Category, condition, images, tradeMethod, location: location.trim(), sellerId: user?.id || '' };
      await productService.update(editId, data); showToast('修改成功', 'success'); goProduct(editId);
    } catch (e: any) { showToast(e.message || '操作失败', 'error'); } finally { setSubmitting(false); }
  };

  if (loadingEdit) return <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}><NavBar title="编辑商品" /><View style={{ padding: '32rpx', display: 'flex', flexDirection: 'column', gap: '32rpx' }}><Skeleton width="100%" style={{ paddingBottom: '60%' }} /><Skeleton width="75%" height="24px" /><Skeleton width="50%" height="16px" /><Skeleton width="100%" height="80px" /></View></View>;
  if (!editId) return <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}><NavBar title="编辑商品" /><EmptyState title="参数错误" description="未找到商品 ID" /></View>;

  const showLocation = tradeMethod === 'pickup' || tradeMethod === 'both';
  const cardStyle = { backgroundColor: '#ffffff', borderRadius: '32rpx', padding: '28rpx', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'all 0.3s ease' };
  const labelStyle = { fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A', display: 'block' as const };
  const getInputStyle = (field: string) => ({ width: '100%', height: '88rpx', paddingLeft: '32rpx', paddingRight: '32rpx', backgroundColor: '#F5F7FA', border: `1px solid ${validation[field as keyof ValidationState]?.valid ? '#EEEEEE' : '#FF4D4F'}`, borderRadius: '24rpx', fontSize: '28rpx', transition: 'all 0.3s ease', animation: shakingField === field ? 'shake 0.3s ease' : 'none' });

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="编辑商品" />
      <ScrollView scrollY style={{ padding: '32rpx', paddingBottom: '200rpx' }}>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}>
          <Text style={{ ...labelStyle, marginBottom: '24rpx' }}>商品图片 <Text style={{ color: '#666666', fontWeight: 'normal' }}>({images.length}/9)</Text></Text>
          {uploadProgress && <View style={{ marginBottom: '24rpx' }}><View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}><Text style={{ fontSize: '24rpx', color: '#2B8CFF' }}>正在上传 {uploadProgress.current}/{uploadProgress.total}</Text><Text style={{ fontSize: '24rpx', color: '#666666' }}>{Math.round(uploadProgress.current / uploadProgress.total * 100)}%</Text></View><View style={{ width: '100%', height: '8px', backgroundColor: '#E8F4FF', borderRadius: '4px', overflow: 'hidden' }}><View style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #2B8CFF 0%, #6C5CE7 100%)', borderRadius: '4px', transition: 'width 0.3s ease' }} /></View></View>}
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24rpx' }}>
            {images.map(id => <View key={id} style={{ position: 'relative', aspectRatio: '1', backgroundColor: '#f5f5f5', borderRadius: '24rpx', overflow: 'hidden' }}><Image src={getImageUrl(id)} mode="aspectFill" style={{ width: '100%', height: '100%' }} /><View onClick={() => handleRemoveImage(id)} style={{ position: 'absolute', top: '12rpx', right: '12rpx', width: '48rpx', height: '48rpx', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: '24rpx', color: '#ffffff' }}></Text></View></View>)}
            {images.length < 9 && <Button onClick={handleImageAdd} style={{ aspectRatio: '1', border: '2px dashed #2B8CFF', borderRadius: '24rpx', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2B8CFF', backgroundColor: 'rgba(43, 140, 255, 0.05)', padding: '0', transition: 'all 0.3s ease' }}><Text style={{ fontSize: '48rpx', color: '#2B8CFF' }}>＋</Text><Text style={{ fontSize: '24rpx', marginTop: '8rpx', color: '#2B8CFF' }}>添加</Text></Button>}
          </View>
        </View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '16rpx' }}>标题</Text><Input type="text" value={title} onInput={e => { setTitle(e.detail.value); validateField('title', e.detail.value); }} placeholder="请输入商品标题" maxlength={50} style={getInputStyle('title')} /><View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12rpx' }}><Text style={{ fontSize: '24rpx', color: validation.title.valid ? '#666666' : '#FF4D4F' }}>{validation.title.touched && !validation.title.valid && validation.title.message}</Text><Text style={{ fontSize: '24rpx', color: '#666666' }}>{title.length}/50</Text></View></View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '16rpx' }}>描述</Text><Textarea value={description} onInput={e => { setDescription(e.detail.value); validateField('description', e.detail.value); }} placeholder="描述商品成色、使用情况等" maxlength={500} style={{ width: '100%', height: '192rpx', padding: '24rpx 32rpx', backgroundColor: '#F5F7FA', border: `1px solid ${validation.description.valid ? '#EEEEEE' : '#FF4D4F'}`, borderRadius: '24rpx', fontSize: '28rpx', boxSizing: 'border-box' }} /><View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12rpx' }}><Text style={{ fontSize: '24rpx', color: '#FF4D4F' }}>{validation.description.touched && !validation.description.valid && validation.description.message}</Text><Text style={{ fontSize: '24rpx', color: '#666666' }}>{description.length}/500</Text></View></View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><View style={{ display: 'flex', gap: '24rpx' }}><View style={{ flex: 1 }}><Text style={{ ...labelStyle, marginBottom: '16rpx' }}>售价</Text><View style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5F7FA', border: `1px solid ${validation.price.valid ? '#EEEEEE' : '#FF4D4F'}`, borderRadius: '24rpx', height: '88rpx', paddingLeft: '32rpx', paddingRight: '32rpx' }}><Text style={{ color: '#666666', fontSize: '28rpx' }}></Text><Input type="digit" value={price} onInput={e => { setPrice(e.detail.value); validateField('price', e.detail.value); }} placeholder="0" style={{ flex: 1, paddingLeft: '16rpx', backgroundColor: 'transparent', fontSize: '28rpx' }} /></View>{price && Number(price) > 0 && <Text style={{ fontSize: '24rpx', color: '#2B8CFF', marginTop: '8px' }}>约 {Number(price).toFixed(2)}</Text>}</View><View style={{ flex: 1 }}><Text style={{ ...labelStyle, marginBottom: '16rpx' }}>原价 <Text style={{ color: '#666666', fontWeight: 'normal' }}>(选填)</Text></Text><View style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5F7FA', border: '1px solid #EEEEEE', borderRadius: '24rpx', height: '88rpx', paddingLeft: '32rpx', paddingRight: '32rpx' }}><Text style={{ color: '#666666', fontSize: '28rpx' }}></Text><Input type="digit" value={originalPrice} onInput={e => setOriginalPrice(e.detail.value)} placeholder="0" style={{ flex: 1, paddingLeft: '16rpx', backgroundColor: 'transparent', fontSize: '28rpx' }} /></View>{originalPrice && Number(originalPrice) > 0 && price && Number(price) > 0 && <Text style={{ fontSize: '24rpx', color: '#52C41A', marginTop: '8px' }}>约 {Math.round((1 - Number(price) / Number(originalPrice)) * 100)}% 折扣</Text>}</View></View></View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '24rpx' }}>分类</Text><View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx' }}>{CATEGORIES.map(cat => <Button key={cat.value} onClick={() => setCategory(cat.value)} style={{ padding: '16rpx 32rpx', borderRadius: '9999px', fontSize: '28rpx', background: category === cat.value ? 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)' : '#F5F7FA', color: category === cat.value ? '#ffffff' : '#666666', border: 'none', lineHeight: '1.5' }}>{cat.label}</Button>)}</View></View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '24rpx' }}>成色</Text><View style={{ display: 'flex', gap: '16rpx' }}>{CONDITIONS.map(c => <Button key={c.value} onClick={() => setCondition(c.value)} style={{ flex: 1, padding: '20rpx 0', borderRadius: '24rpx', fontSize: '28rpx', background: condition === c.value ? 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)' : '#F5F7FA', color: condition === c.value ? '#ffffff' : '#666666', border: 'none', lineHeight: '1.5' }}>{c.label}</Button>)}</View></View>
        <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '24rpx' }}>交易方式</Text><View style={{ display: 'flex', gap: '16rpx' }}>{TRADE_METHODS.map(m => <Button key={m.value} onClick={() => setTradeMethod(m.value)} style={{ flex: 1, padding: '20rpx 0', borderRadius: '24rpx', fontSize: '28rpx', background: tradeMethod === m.value ? 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)' : '#F5F7FA', color: tradeMethod === m.value ? '#ffffff' : '#666666', border: 'none', lineHeight: '1.5' }}>{m.label}</Button>)}</View></View>
        {showLocation && <View style={{ ...cardStyle, marginBottom: '32rpx' }}><Text style={{ ...labelStyle, marginBottom: '16rpx' }}>交易地点</Text><Input type="text" value={location} onInput={e => setLocation(e.detail.value)} placeholder="如：紫荆公寓3号楼" maxlength={50} style={{ width: '100%', height: '88rpx', paddingLeft: '32rpx', paddingRight: '32rpx', backgroundColor: '#F5F7FA', border: '1px solid #EEEEEE', borderRadius: '24rpx', fontSize: '28rpx' }} /></View>}
      </ScrollView>
      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTop: '1px solid #EEEEEE', padding: '24rpx 32rpx', zIndex: 40, paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <Button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', height: '96rpx', background: submitting ? '#CCCCCC' : 'linear-gradient(135deg, #2B8CFF 0%, #6C5CE7 100%)', color: '#ffffff', borderRadius: '32rpx', fontWeight: 600, fontSize: '32rpx', border: 'none', boxShadow: submitting ? 'none' : '0 4px 15px rgba(43, 140, 255, 0.4)', lineHeight: '1.5' }}>{submitting ? '提交中...' : '保存修改'}</Button>
      </View>
    </View>
  );
}
