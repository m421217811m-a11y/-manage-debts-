import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { Field, PrimaryButton, Screen } from '@/components/Ui';
import { useApp } from '@/lib/AppContext';
import { makeId } from '@/lib/types';

export default function AddPersonScreen() {
  const { addPerson } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!name.trim()) {
      Alert.alert('الاسم مطلوب', 'اكتب اسم الشخص أولًا.');
      return;
    }
    setSaving(true);
    await addPerson({ id: makeId('person'), name: name.trim(), phone: phone.trim() || undefined, note: note.trim() || undefined, createdAt: new Date().toISOString() });
    setSaving(false);
    router.back();
  }
  return <Screen><AppHeader title="إضافة شخص" subtitle="أضف شخصًا لمتابعة حسابه" back /><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}><Text style={styles.intro}>ابدأ باسم واضح، ويمكنك إضافة التفاصيل لاحقًا.</Text><Field label="الاسم *" value={name} onChangeText={setName} placeholder="مثال: أحمد محمد" /><Field label="رقم الهاتف" value={phone} onChangeText={setPhone} placeholder="اختياري" keyboardType="phone-pad" /><Field label="ملاحظة" value={note} onChangeText={setNote} placeholder="اختيارية" multiline /><PrimaryButton title={saving ? 'جارٍ الحفظ…' : 'حفظ الشخص'} onPress={save} icon="check" disabled={saving} /></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 40 }, intro: { fontSize: 14, lineHeight: 22, textAlign: 'right', color: '#7B817C', marginBottom: 24 } });