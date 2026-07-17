import { useState } from 'react';
import { useLoad } from '@tarojs/taro';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import { useSearchStore } from '@/stores/searchStore';
import { useAuthStore } from '@/stores/authStore';
import { uploadService } from '@/services/uploadService';
import { formatPrice } from '@/utils/format';
import { CATEGORY_MAP } from '@/constants/categories';
import { CONDITIONS, CONDITION_MAP } from '@/constants/conditions';
import { TRADE_METHODS, TRADE_METHOD_MAP } from '@/constants/tradeMethods';
import { productService } from '@/services/productService';
import { EmptyState } from '@/components/shared/Feedback';
import NavBar from '@/components/layout/NavBar';
import { goProduct, goLogin, getPageParams } from '@/utils/nav';
import { showConfirm } from '@/utils/taro';
import type { Product } from '@/types';

const SORT_OPTIONS: { value: 'latest' | 'price_asc' | 'price_desc'; label: string }[] = [
  { value: 'latest', label: '最新发布' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
];

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { history, addToHistory, clearHistory, removeFromHistory, loadHistory, filters, setFilters, clearFilters } = useSearchStore();
  const logout = useAuthStore(s => s.logout);

  useLoad(() => {
    loadHistory();
    const params = getPageParams();
    if (params.keyword) {
      setKeyword(params.keyword);
      handleSearch(params.keyword);
    }
  });

  const handleSearch = async (kw?: string) => {
    const query = (kw ?? keyword).trim();
    if (!query) return;

    addToHistory(query);
    setSearched(true);
    setShowFilters(false);

    const params = {
      keyword: query,
      pageSize: 50,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      condition: filters.condition,
      tradeMethod: filters.tradeMethod,
      sort: filters.sort,
    };

    const result = await productService.list(params);
    setResults(result.items);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('退出登录', '确定退出登录？');
    if (!confirmed) return;
    await logout();
    goLogin();
  };

  const hasActiveFilters = filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.condition || (filters.tradeMethod && filters.tradeMethod !== 'both');

  const FilterSection = () => (
    <View style={{ backgroundColor: '#ffffff', borderTop: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE', padding: '24rpx 32rpx' }}>
      {/* Sort */}
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '6px', display: 'block' }}>排序</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SORT_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              onClick={() => setFilters({ sort: opt.value })}
              style={{
                paddingLeft: '24rpx',
                paddingRight: '24rpx',
                paddingTop: '12rpx',
                paddingBottom: '12rpx',
                borderRadius: '9999px',
                fontSize: '24rpx',
                backgroundColor: filters.sort === opt.value ? '#2B8CFF' : '#F5F7FA',
                color: filters.sort === opt.value ? '#ffffff' : '#666666',
                border: 'none',
                lineHeight: '1.5',
              }}
            >
              {opt.label}
            </Button>
          ))}
        </View>
      </View>

      {/* Price range */}
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '6px', display: 'block' }}>价格区间（元）</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            type="number"
            placeholder="最低价"
            value={filters.minPrice === undefined ? '' : String(filters.minPrice / 100)}
            onInput={e => {
              const val = e.detail.value;
              setFilters({ minPrice: val ? Math.round(Number(val) * 100) : undefined });
            }}
            style={{
              flex: 1,
              height: '76rpx',
              paddingLeft: '24rpx',
              paddingRight: '24rpx',
              backgroundColor: '#F5F7FA',
              border: '1px solid #EEEEEE',
              borderRadius: '24rpx',
              fontSize: '28rpx',
            }}
          />
          <Text style={{ color: '#666666' }}>-</Text>
          <Input
            type="number"
            placeholder="最高价"
            value={filters.maxPrice === undefined ? '' : String(filters.maxPrice / 100)}
            onInput={e => {
              const val = e.detail.value;
              setFilters({ maxPrice: val ? Math.round(Number(val) * 100) : undefined });
            }}
            style={{
              flex: 1,
              height: '76rpx',
              paddingLeft: '24rpx',
              paddingRight: '24rpx',
              backgroundColor: '#F5F7FA',
              border: '1px solid #EEEEEE',
              borderRadius: '24rpx',
              fontSize: '28rpx',
            }}
          />
        </View>
      </View>

      {/* Condition */}
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '6px', display: 'block' }}>成色</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Button
            onClick={() => setFilters({ condition: undefined })}
            style={{
              paddingLeft: '24rpx',
              paddingRight: '24rpx',
              paddingTop: '12rpx',
              paddingBottom: '12rpx',
              borderRadius: '9999px',
              fontSize: '24rpx',
              backgroundColor: !filters.condition ? '#2B8CFF' : '#F5F7FA',
              color: !filters.condition ? '#ffffff' : '#666666',
              border: 'none',
              lineHeight: '1.5',
            }}
          >
            全部
          </Button>
          {CONDITIONS.map(c => (
            <Button
              key={c.value}
              onClick={() => setFilters({ condition: c.value })}
              style={{
                paddingLeft: '24rpx',
                paddingRight: '24rpx',
                paddingTop: '12rpx',
                paddingBottom: '12rpx',
                borderRadius: '9999px',
                fontSize: '24rpx',
                backgroundColor: filters.condition === c.value ? '#2B8CFF' : '#F5F7FA',
                color: filters.condition === c.value ? '#ffffff' : '#666666',
                border: 'none',
                lineHeight: '1.5',
              }}
            >
              {c.label}
            </Button>
          ))}
        </View>
      </View>

      {/* Trade method */}
      <View style={{ marginBottom: '16px' }}>
        <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '6px', display: 'block' }}>交易方式</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Button
            onClick={() => setFilters({ tradeMethod: undefined })}
            style={{
              paddingLeft: '24rpx',
              paddingRight: '24rpx',
              paddingTop: '12rpx',
              paddingBottom: '12rpx',
              borderRadius: '9999px',
              fontSize: '24rpx',
              backgroundColor: !filters.tradeMethod ? '#2B8CFF' : '#F5F7FA',
              color: !filters.tradeMethod ? '#ffffff' : '#666666',
              border: 'none',
              lineHeight: '1.5',
            }}
          >
            全部
          </Button>
          {TRADE_METHODS.map(m => (
            <Button
              key={m.value}
              onClick={() => setFilters({ tradeMethod: m.value })}
              style={{
                paddingLeft: '24rpx',
                paddingRight: '24rpx',
                paddingTop: '12rpx',
                paddingBottom: '12rpx',
                borderRadius: '9999px',
                fontSize: '24rpx',
                backgroundColor: filters.tradeMethod === m.value ? '#2B8CFF' : '#F5F7FA',
                color: filters.tradeMethod === m.value ? '#ffffff' : '#666666',
                border: 'none',
                lineHeight: '1.5',
              }}
            >
              {m.label}
            </Button>
          ))}
        </View>
      </View>

      <View style={{ display: 'flex', gap: '24rpx', paddingTop: '8px' }}>
        <Button
          onClick={() => { clearFilters(); }}
          style={{
            flex: 1,
            height: '80rpx',
            border: '1px solid #EEEEEE',
            borderRadius: '24rpx',
            fontSize: '28rpx',
            color: '#666666',
            backgroundColor: '#ffffff',
            lineHeight: '1.5',
          }}
        >
          重置
        </Button>
        <Button
          onClick={() => handleSearch()}
          style={{
            flex: 1,
            height: '80rpx',
            backgroundColor: '#2B8CFF',
            color: '#ffffff',
            borderRadius: '24rpx',
            fontSize: '28rpx',
            fontWeight: 500,
            border: 'none',
            lineHeight: '1.5',
          }}
        >
          应用筛选
        </Button>
      </View>
    </View>
  );

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <NavBar title="搜索" />

      {/* Search bar */}
      <View style={{ padding: '24rpx 32rpx', backgroundColor: '#F5F7FA', position: 'sticky', top: 0, zIndex: 20 }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <View style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #EEEEEE', borderRadius: '24rpx', paddingLeft: '24rpx', paddingRight: '24rpx', height: '80rpx' }}>
            <Text style={{ fontSize: '36rpx', color: '#8A8A8A', marginRight: '16rpx' }}>🔍</Text>
            <Input
              type="text"
              value={keyword}
              onInput={e => setKeyword(e.detail.value)}
              onConfirm={() => handleSearch()}
              confirmType="search"
              placeholder="搜索商品..."
              style={{ flex: 1, backgroundColor: 'transparent', fontSize: '28rpx' }}
              focus
            />
            {keyword && (
              <View onClick={() => { setKeyword(''); setResults([]); setSearched(false); }} style={{ padding: '4px' }}>
                <Text style={{ fontSize: '32rpx', color: '#8A8A8A' }}>✕</Text>
              </View>
            )}
          </View>
          <View onClick={() => setShowFilters(v => !v)} style={{ position: 'relative', padding: '4px 8px' }}>
            <Text style={{ fontSize: '28rpx', color: '#2B8CFF', fontWeight: 500 }}>筛选</Text>
            {hasActiveFilters && <View style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#FF4D4F', borderRadius: '50%' }} />}
          </View>
          <View onClick={() => handleSearch()} style={{ padding: '4px 4px' }}>
            <Text style={{ fontSize: '28rpx', color: '#2B8CFF', fontWeight: 500 }}>搜索</Text>
          </View>
          <View onClick={handleLogout} style={{ padding: '4px 4px' }}>
            <Text style={{ fontSize: '28rpx', color: '#FF4D4F', fontWeight: 500 }}>退出</Text>
          </View>
        </View>
      </View>

      {/* Filter panel */}
      {showFilters && <FilterSection />}

      {/* Search history - always visible */}
      <View style={{ padding: '24rpx 32rpx' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A' }}>搜索历史</Text>
          {history.length > 0 && (
            <View onClick={clearHistory} style={{ padding: '4px' }}>
              <Text style={{ fontSize: '24rpx', color: '#666666' }}>清空</Text>
            </View>
          )}
        </View>
        {history.length === 0 ? (
          <Text style={{ fontSize: '24rpx', color: '#666666' }}>暂无搜索历史</Text>
        ) : (
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {history.map(h => (
              <View key={h} style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '12rpx', paddingBottom: '12rpx', backgroundColor: '#ffffff', border: '1px solid #EEEEEE', borderRadius: '9999px' }}>
                <View onClick={() => { setKeyword(h); handleSearch(h); }}>
                  <Text style={{ fontSize: '24rpx', color: '#666666' }}>{h}</Text>
                </View>
                <View onClick={() => removeFromHistory(h)} style={{ padding: '2px' }}>
                  <Text style={{ fontSize: '24rpx', color: '#666666' }}>✕</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Results */}
      <ScrollView scrollY style={{ padding: '0 16px 24px 16px' }}>
        {searched ? (
          results.length === 0 ? (
            <EmptyState
              title="未找到相关商品"
              description="换个关键词或调整筛选条件试试"
              icon={<Text style={{ fontSize: '48px', color: '#999999' }}>🔍</Text>}
            />
          ) : (
            <>
              <Text style={{ fontSize: '24rpx', color: '#666666', marginBottom: '12px' }}>找到 {results.length} 个结果</Text>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '24rpx' }}>
                {results.map(product => (
                  <View
                    key={product.id}
                    onClick={() => goProduct(product.id)}
                    style={{ display: 'flex', gap: '24rpx', backgroundColor: '#ffffff', borderRadius: '16px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                  >
                    <View style={{ width: '180rpx', height: '180rpx', backgroundColor: '#f5f5f5', borderRadius: '24rpx', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].startsWith('data:') ? product.images[0] : (uploadService.getUrl(product.images[0]) || product.images[0])}
                          mode="aspectFill"
                          style={{ width: '180rpx', height: '180rpx', borderRadius: '24rpx' }}
                        />
                      ) : (
                        <Text style={{ fontSize: '28px', color: '#cccccc' }}>🖼️</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0, paddingTop: '4px', paddingBottom: '4px' }}>
                      <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A1A1A', lineHeight: '40rpx', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.title}</Text>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#2B8CFF' }}>¥{formatPrice(product.price)}</Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Text style={{ fontSize: '24rpx', color: '#666666', textDecoration: 'line-through' }}>¥{formatPrice(product.originalPrice)}</Text>
                        )}
                      </View>
                      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <Text style={{ fontSize: '20rpx', color: '#666666', backgroundColor: '#f5f5f5', borderRadius: '9999px', paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '4rpx', paddingBottom: '4rpx' }}>{CATEGORY_MAP[product.category]}</Text>
                        <Text style={{ fontSize: '20rpx', color: '#2B8CFF', backgroundColor: '#E8F4FF', borderRadius: '9999px', paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '4rpx', paddingBottom: '4rpx' }}>{CONDITION_MAP[product.condition]}</Text>
                        <Text style={{ fontSize: '20rpx', color: '#666666', backgroundColor: '#f5f5f5', borderRadius: '9999px', paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '4rpx', paddingBottom: '4rpx' }}>{TRADE_METHOD_MAP[product.tradeMethod]}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )
        ) : (
          <EmptyState title="输入关键词开始搜索" description="试试：教材、手机、自行车" />
        )}
      </ScrollView>
    </View>
  );
}
