import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

type Rule = {
  ruleName: string;
  ruleDesc: string;
};

export async function POST(req: Request) {
  try {
    const { page_name, theme, pagetype, description, bannerUrl, rules } = await req.json();

    let normalizedName;

    // Normalize page_name: replace spaces with underscores
    if (page_name) {
      normalizedName = page_name.trim().replace(/\s+/g, "_");
    }

    if (!normalizedName || !pagetype || !bannerUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: "Rules must be an array" }, { status: 400 });
    }

    const isCourse = pagetype === "categories";
    let pageResult;

    // Insert page
    if (isCourse) {
      pageResult = await sql`
        INSERT INTO categories (category_name, theme, description, banner, created_at)
        VALUES (${normalizedName}, ${theme}, ${description}, ${bannerUrl}, NOW())
        RETURNING id;
      `;
    } else if (pagetype === "organization") {
      pageResult = await sql`
        INSERT INTO organization (name, theme, description, banner, created_at, categories_id)
        VALUES (${normalizedName}, ${theme}, ${description}, ${bannerUrl}, NOW(), NULL)
        RETURNING id;
      `;
    } else {
      return NextResponse.json({ error: "Invalid page type" }, { status: 400 });
    }

    const pageId = pageResult[0].id;

    // Insert rules with `num` for ordering
    for (let i = 0; i < (rules as Rule[]).length; i++) {
      const { ruleName, ruleDesc } = rules[i];
      if (!ruleName || !ruleDesc) continue;

      await sql`
        INSERT INTO rules (page_id, page_type, rules, description, num)
        VALUES (${pageId}, ${isCourse}, ${ruleName}, ${ruleDesc}, ${i + 1})
      `;
    }

    return NextResponse.json({ success: true, pageId });
  } catch (err) {
    console.error("❌ Error creating page and rules:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}