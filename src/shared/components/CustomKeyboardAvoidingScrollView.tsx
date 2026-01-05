import React, { ReactNode } from 'react';
import { StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  contentContainerStyle?: object;
  insideModal?: boolean;
  extraScrollHeight?: number;
  stickyFooter?: ReactNode;
};

const CustomKeyboardAvoidingScrollView = ({
  children,
  contentContainerStyle,
  insideModal = false,
  extraScrollHeight,
  stickyFooter,
}: Props) => {
  const insets = useSafeAreaInsets();

  const calculatedExtraHeight =
    extraScrollHeight ??
    (insideModal
      ? Platform.OS === 'ios'
        ? 50
        : 50
      : Platform.OS === 'ios'
      ? 50
      : 50);

  const Container = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const containerProps = Platform.OS === 'ios' 
    ? { 
        behavior: 'padding' as const, 
        style: { flex: 1 },
        keyboardVerticalOffset: insideModal ? 0 : 0 // KeyboardAwareScrollView generally handles the heavy lifting, but we need KAV for the footer
      } 
    : { style: { flex: 1 } };

  return (
    <Container {...containerProps}>
        <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
            styles.content,
            contentContainerStyle,
        ]}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={calculatedExtraHeight}
        extraHeight={calculatedExtraHeight}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
        >
        {children}
        {/* If no sticky footer, add safe area here. If sticky footer exists, it handles the bottom spacing */}
        {!stickyFooter && <View style={{ height: insets.bottom }} />}
        </KeyboardAwareScrollView>
        
        {stickyFooter && (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                {stickyFooter}
            </View>
        )}
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 24,
  },
  footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
      backgroundColor: '#fff',
  }
});

export default CustomKeyboardAvoidingScrollView;
