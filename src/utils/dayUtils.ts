import { DayOfWeek, DishCategory, DishItem } from '../types';
import { DAYS_OF_WEEK, CATEGORIES } from '../data/mockDishes';

export function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  switch (dayIndex) {
    case 1:
      return 't2';
    case 2:
      return 't3';
    case 3:
      return 't4';
    case 4:
      return 't5';
    case 5:
      return 't6';
    case 6:
      return 't7';
    case 0:
    default:
      return 'cn';
  }
}

export function getDayLabel(dayId: DayOfWeek): string {
  const day = DAYS_OF_WEEK.find((d) => d.id === dayId);
  return day ? day.label : dayId;
}

export function getCategoryLabel(categoryId: DishCategory): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

export function filterDishes(
  dishes: DishItem[],
  selectedDay: DayOfWeek | 'today',
  selectedCategory: DishCategory | 'all_categories',
  searchQuery: string = '',
  onlyAvailable: boolean = false
): DishItem[] {
  const targetDay = selectedDay === 'today' ? getTodayDayOfWeek() : selectedDay;

  return dishes.filter((dish) => {
    // Check day availability:
    // If targetDay is 'all' (Cả tuần), show only dishes that are available all week ('all' in availableDays)
    // If targetDay is specific day (e.g., 't2'), show dishes for 't2' AND also all-week dishes ('all')
    const matchesDay =
      targetDay === 'all'
        ? dish.availableDays.includes('all')
        : dish.availableDays.includes(targetDay) || dish.availableDays.includes('all');

    // Check category:
    const matchesCategory =
      selectedCategory === 'all_categories' || dish.category === selectedCategory;

    // Check search query (match name, description, tags, unit):
    const query = (typeof searchQuery === 'string' ? searchQuery : '').trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query) ||
      dish.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      dish.unit.toLowerCase().includes(query);

    // Check availability stock toggle if onlyAvailable filter is checked:
    const matchesStock = onlyAvailable ? dish.isAvailableToday : true;

    return matchesDay && matchesCategory && matchesSearch && matchesStock;
  });
}

export function getDishesCountByDay(dishes: DishItem[]): Record<string, number> {
  const counts: Record<string, number> = {
    today: 0,
    all: 0,
    t2: 0,
    t3: 0,
    t4: 0,
    t5: 0,
    t6: 0,
    t7: 0,
    cn: 0,
  };

  const today = getTodayDayOfWeek();

  dishes.forEach((dish) => {
    // Check if available today
    if (dish.availableDays.includes(today) || dish.availableDays.includes('all')) {
      counts['today'] = (counts['today'] || 0) + 1;
    }

    if (dish.availableDays.includes('all')) {
      counts['all'] = (counts['all'] || 0) + 1;
      // All week dishes also contribute to every individual day count
      DAYS_OF_WEEK.forEach((d) => {
        if (d.id !== 'all') {
          counts[d.id] = (counts[d.id] || 0) + 1;
        }
      });
    } else {
      dish.availableDays.forEach((dayId) => {
        counts[dayId] = (counts[dayId] || 0) + 1;
      });
    }
  });

  return counts;
}

export function getCategoryCounts(
  dishes: DishItem[],
  selectedDay: DayOfWeek | 'today'
): Record<string, number> {
  const targetDay = selectedDay === 'today' ? getTodayDayOfWeek() : selectedDay;

  const dayDishes = dishes.filter((dish) =>
    targetDay === 'all'
      ? dish.availableDays.includes('all')
      : dish.availableDays.includes(targetDay) || dish.availableDays.includes('all')
  );

  const counts: Record<string, number> = {
    all_categories: dayDishes.length,
  };

  CATEGORIES.forEach((cat) => {
    if (cat.id !== 'all_categories') {
      counts[cat.id] = dayDishes.filter((d) => d.category === cat.id).length;
    }
  });

  return counts;
}
