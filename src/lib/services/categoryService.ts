import { connectMongo } from "@/lib/db/mongoose";
import { CategoryModel, type CategoryDocument } from "@/lib/models/Category";

type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description?: string;
};

const defaultCategories: Array<Omit<CategoryDto, "id">> = [
  {
    slug: "career",
    name: "キャリア",
    description: "仕事や転職に関する学び",
  },
  {
    slug: "relationships",
    name: "人間関係",
    description: "家族・友人・同僚との関係",
  },
  {
    slug: "finance",
    name: "お金",
    description: "資産形成・失敗談",
  },
  {
    slug: "health",
    name: "健康",
    description: "心身のコンディション管理",
  },
  {
    slug: "learning",
    name: "学び",
    description: "スキル・勉強の気づき",
  },
];

function mapCategory(doc: CategoryDocument): CategoryDto {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? undefined,
  };
}

export async function listCategories(): Promise<CategoryDto[]> {
  await connectMongo();
  const categories = await CategoryModel.find().sort({ name: 1 }).exec();
  return categories.map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryDto | null> {
  await connectMongo();
  const category = await CategoryModel.findOne({ slug }).exec();
  return category ? mapCategory(category) : null;
}

export async function ensureDefaultCategories(): Promise<void> {
  await connectMongo();
  await Promise.all(
    defaultCategories.map(async (category) => {
      await CategoryModel.updateOne(
        { slug: category.slug },
        { $setOnInsert: category },
        { upsert: true }
      );
    })
  );
}
