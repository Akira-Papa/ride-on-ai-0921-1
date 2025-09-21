'use client';

import Add from '@mui/icons-material/Add';
import Check from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createPostAction, updatePostAction } from '@/app/(dashboard)/posts/actions';
import {
  INITIAL_STATE,
  type ActionState,
} from '@/app/(dashboard)/posts/action-helpers';
import { useFeedback } from '@/components/feedback/FeedbackProvider';

import type { PostDetail } from '@/lib/types/posts';

const MAX_TAGS = 5;

export type CategoryOption = {
  id: string;
  name: string;
};

type PostFormProps = {
  categories: CategoryOption[];
  mode: 'create' | 'edit';
  defaultValue?: PostDetail;
};

export function PostForm({ categories, mode, defaultValue }: PostFormProps) {
  const [tags, setTags] = useState<string[]>(defaultValue?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'member' | 'private'>(
    defaultValue?.visibility ?? 'member',
  );
  const router = useRouter();
  const feedback = useFeedback();
  const tPosts = useTranslations('posts');
  const tValidation = useTranslations('validation');
  const tFeedback = useTranslations('feedback');
  const tErrors = useTranslations('errors');

  const resolveMessage = (message?: string) => {
    if (!message) {
      return tFeedback('errorGeneric');
    }
    if (message.startsWith('feedback.')) {
      return tFeedback(message.replace('feedback.', ''));
    }
    if (message.startsWith('errors.')) {
      return tErrors(message.replace('errors.', ''));
    }
    return message;
  };

  const action = useMemo(
    () => (mode === 'create' ? createPostAction : updatePostAction),
    [mode],
  );

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    action,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.status === 'success' && state.postId) {
      const messageKey =
        mode === 'create' ? 'postCreated' : 'postUpdated';
      feedback.showSuccess(tFeedback(messageKey));
      router.push(`/posts/${state.postId}`);
    }
  }, [state, feedback, router, tFeedback, mode]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) {
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const fieldError = (name: string) => state.errors?.[name];
  const fieldErrorMessage = (name: string) => {
    const message = fieldError(name);
    return message ? tValidation(message) : undefined;
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="visibility" value={visibility} />
      {mode === 'edit' && defaultValue && (
        <input type="hidden" name="id" value={defaultValue.id} />
      )}
      {tags.map((tag) => (
        <input key={tag} type="hidden" name="tags" value={tag} />
      ))}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {state.status === 'error' && state.message && (
          <Typography color="error">
            {resolveMessage(state.message)}
          </Typography>
        )}
        <TextField
          name="title"
          label="タイトル"
          placeholder={tPosts('titlePlaceholder')}
          defaultValue={defaultValue?.title ?? ''}
          required
          error={Boolean(fieldError('title'))}
          helperText={fieldErrorMessage('title')}
          inputProps={{ maxLength: 120 }}
        />
        <FormControl fullWidth>
          <InputLabel id="category-select">カテゴリ</InputLabel>
          <Select
            labelId="category-select"
            label="カテゴリ"
            name="categoryId"
            defaultValue={defaultValue?.category.id ?? ''}
            required
            error={Boolean(fieldError('categoryId'))}
          >
            <MenuItem value="" disabled>
              カテゴリを選択
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          {fieldErrorMessage('categoryId') && (
            <FormHelperText error>
              {fieldErrorMessage('categoryId')}
            </FormHelperText>
          )}
        </FormControl>
        <TextField
          name="lesson"
          label="教訓"
          placeholder={tPosts('lessonPlaceholder')}
          defaultValue={defaultValue?.lesson ?? ''}
          required
          multiline
          minRows={6}
          error={Boolean(fieldError('lesson'))}
          helperText={fieldErrorMessage('lesson')}
        />
        <TextField
          name="situationalContext"
          label={tPosts('contextLabel')}
          placeholder="状況を簡潔に記入してください"
          defaultValue={defaultValue?.situationalContext ?? ''}
          multiline
          minRows={3}
          error={Boolean(fieldError('situationalContext'))}
          helperText={fieldErrorMessage('situationalContext')}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {tPosts('tagsDescription')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                onDelete={() => handleRemoveTag(tag)}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="タグを入力して Enter"
              disabled={tags.length >= MAX_TAGS}
            />
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={(event) => {
                event.preventDefault();
                handleAddTag();
              }}
              disabled={tags.length >= MAX_TAGS || !tagInput.trim()}
            >
              追加
            </Button>
          </Box>
          {fieldErrorMessage('tags') && (
            <FormHelperText error>
              {fieldErrorMessage('tags')}
            </FormHelperText>
          )}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            表示範囲
          </Typography>
          <ToggleButtonGroup
            value={visibility}
            exclusive
            onChange={(_event, value) => {
              if (value) {
                setVisibility(value);
              }
            }}
            color="primary"
          >
            <ToggleButton value="member">{tPosts('visibilityMember')}</ToggleButton>
            <ToggleButton value="private">{tPosts('visibilityPrivate')}</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {state.errors?._form && (
          <Typography color="error">
            {tValidation(state.errors._form)}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="text" onClick={() => router.back()}>
            {tPosts('cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={mode === 'create' ? <Add /> : <Check />}
          >
            {tPosts('submit')}
          </Button>
        </Box>
      </Box>
    </form>
  );
}
